// farmacia-backend/routes/recetasRoutes.js

const express     = require("express");
const axios       = require("axios");
const PDFDocument = require("pdfkit");
const dotenv      = require("dotenv");
dotenv.config();

const { verifyToken } = require("../utils/authMiddleware");
const Medicamento  = require("../models/Medicamento");
const Venta        = require("../models/Venta");
const RecetaAseg   = require("../models/Receta"); // Modelo local de Farmacia

const router = express.Router();

const HOSPITAL_API_URL    = process.env.HOSPITAL_API_URL    || "http://localhost:8080";
const ASEGURADORA_API_URL = (process.env.ASEGURADORA_API_URL_RECETAS
                              || "http://localhost:5001/api/recetas"
                            ).replace(/\/+$/,"");

/**
 * GET /solicitar/:codigo
 */
router.get("/solicitar/:codigo", verifyToken, async (req, res) => {
  try {
    const { codigo } = req.params;
    const token      = req.headers.authorization;
    const numeroAfiliacion = req.query.numeroAfiliacion; // opcional

    // 1) Traer receta del Hospital
    const { data: receta } = await axios.get(
      `${HOSPITAL_API_URL}/recetas/${codigo}`,
      { headers: { Authorization: token } }
    );
    if (!receta) return res.status(404).json({ error: "Receta no encontrada" });

    // 2) Verificar stock y buscar alternativos
    const meds = [];
    let completa = true;
    for (const item of receta.medicamentos) {
      const m    = item.medicamento || {};
      const id   = m.idMedicamento;
      const cant = parseInt(item.dosis, 10) || 1;
      const doc  = await Medicamento.findOne({ idMedicamento: id });
      const un   = doc?.unidadesPorPresentacion || m.unidadesPorPresentacion || 1;

      if (doc && doc.stock >= cant) {
        meds.push({
          idMedicamento: id,
          nombre:        m.principioActivo,
          cantidad:      cant,
          disponible:    true,
          presentacion:  doc.presentacion,
          unidadesPorPresentacion: un,
          precio_unitario:         doc.precio
        });
      } else {
        const alt = await Medicamento.findOne({
          principioActivo: m.principioActivo,
          stock: { $gte: cant }
        });
        if (alt) {
          meds.push({
            idMedicamento: alt.idMedicamento,
            nombre:        alt.principioActivo,
            cantidad:      cant,
            disponible:    true,
            presentacion:  alt.presentacion,
            unidadesPorPresentacion: alt.unidadesPorPresentacion,
            precio_unitario:         alt.precio
          });
        } else {
          completa = false;
          meds.push({
            idMedicamento: id,
            nombre:        m.principioActivo,
            cantidad:      cant,
            disponible:    false,
            presentacion:  m.presentacion || "N/A",
            unidadesPorPresentacion: un,
            precio_unitario:         doc?.precio || 0
          });
        }
      }
    }
    if (!completa) {
      return res.status(400).json({ error: "Faltan medicamentos", medicamentos: meds });
    }

    // 3) Calcular total
    const total = meds.reduce((s, m) => s + m.cantidad * (m.precio_unitario || 0), 0);

    // 4) Registrar en Aseguradora (POST /api/recetas)
    try {
      await axios.post(
        `${ASEGURADORA_API_URL}`,
        {
          codigo,
          cliente: receta.idPaciente,
          farmacia: "Farmacia Verde",
          total
        },
        { headers: { Authorization: token, "Content-Type": "application/json" } }
      );
    } catch (err) {
      // ignorar 409 Conflict si ya existe
      if (err.response?.status !== 409) throw err;
    }

    // 5) Validar en Aseguradora (POST /api/recetas/validar)
    const validarPayload = {
      codigo,
      farmacia: "Farmacia Verde",
      total,
      ...(numeroAfiliacion ? { numeroAfiliacion } : {})
    };
    const { data: seguro } = await axios.post(
      `${ASEGURADORA_API_URL}/validar`,
      validarPayload,
      { headers: { Authorization: token, "Content-Type": "application/json" } }
    );
    const { estado, descuento = 0, mensaje, infoDescuento } = seguro;
    const totalFinal = total - descuento;

    // 6) Guardar en BD de Farmacia
    await RecetaAseg.create({
      codigo,
      paciente:      receta.nombrePaciente,
      medicamentos:  meds.map(m => ({
        codigo:          String(m.idMedicamento),
        nombre:          m.nombre,
        principioActivo: m.nombre,
        cantidad:        m.cantidad,
        dosis:           String(m.cantidad),
        frecuencia:      "N/A",      // <-- Ya no está vacío
        duracionDias:    0
      })),
      fechaEmision:  new Date(),
      total,
      descuento,
      totalFinal,
      estadoSeguro:  estado
    });

    // 7) Devolver al frontend
    return res.json({
      codigo,
      idPaciente:    receta.idPaciente,
      nombrePaciente: receta.nombrePaciente,
      medicamentos:  meds,
      total,
      descuento,
      totalFinal,
      estadoSeguro:  estado,
      mensaje,
      infoDescuento
    });

  } catch (err) {
    console.error("Error al solicitar receta:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

/**
 * POST /comprar
 * — Procesa compra, actualiza stock, guarda Venta y genera PDF
 */
router.post("/comprar", verifyToken, async (req, res) => {
  try {
    const { codigo, tieneSeguro, numeroAfiliacion } = req.body;
    const token = req.headers.authorization;

    // 1) Traer receta del Hospital
    const { data: receta } = await axios.get(
      `${HOSPITAL_API_URL}/recetas/${codigo}`,
      { headers: { Authorization: token } }
    );
    if (!receta) return res.status(404).json({ error: "Receta no encontrada" });

    // 2) Verificar stock y alternativos (igual que en /solicitar)…
    const medsVenta = [];
    for (const item of receta.medicamentos) {
      const m    = item.medicamento || {};
      const id   = m.idMedicamento;
      const cant = parseFloat(item.dosis) || 1;
      const doc  = await Medicamento.findOne({ idMedicamento: id });
      if (doc && doc.stock >= cant) {
        medsVenta.push({ medicamentoDoc: doc, cantidadAVender: cant, precioUnitario: doc.precio, nombre: m.principioActivo, idMedicamento: id });
      } else {
        const alt = await Medicamento.findOne({ principioActivo: m.principioActivo, stock: { $gte: cant } });
        if (alt) {
          medsVenta.push({ medicamentoDoc: alt, cantidadAVender: cant, precioUnitario: alt.precio, nombre: alt.principioActivo, idMedicamento: alt.idMedicamento });
        } else {
          return res.status(400).json({ error: "Faltan medicamentos", medicamentos: medsVenta });
        }
      }
    }

    // 3) Calcular total bruto
    const totalBruto = medsVenta.reduce((s, m) => s + m.cantidadAVender * m.precioUnitario, 0);

    // 4) Si tiene seguro, volver a validar en Aseguradora para obtener descuento
    let descuento = 0;
    if (tieneSeguro) {
      const payload = {
        codigo,
        farmacia: "Farmacia Verde",
        total: totalBruto,
        ...(numeroAfiliacion ? { numeroAfiliacion } : {})
      };
      const { data: seguro } = await axios.post(
        `${ASEGURADORA_API_URL}/validar`,
        payload,
        { headers: { Authorization: token, "Content-Type": "application/json" } }
      );
      descuento = seguro.descuento || 0;
    }

    const totalFinal = totalBruto - descuento;

    // 5) Actualizar stock
    for (const i of medsVenta) {
      await Medicamento.updateOne(
        { idMedicamento: i.idMedicamento },
        { $inc: { stock: -i.cantidadAVender } }
      );
    }

    // 6) Guardar Venta
    const venta = new Venta({
      medicamentos: medsVenta.map(i => ({
        medicamentoId: i.medicamentoDoc._id,
        cantidad:      i.cantidadAVender,
        precioUnitario: i.precioUnitario
      })),
      montoTotal: totalFinal,
      usuario:    req.user._id
    });
    await venta.save();

    // 7) Generar PDF con descuento incluido
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      res.json({
        mensaje:    "Compra procesada exitosamente",
        total:      totalBruto,
        descuento,
        totalFinal,
        pdfFactura: Buffer.concat(buffers).toString("base64")
      });
    });

    doc.fontSize(18).text("Factura de Compra", { align: "center" }).moveDown();
    doc.fontSize(12)
       .text(`Código Receta: ${codigo}`)
       .text(`Fecha: ${new Date().toLocaleString()}`)
       .moveDown();

    medsVenta.forEach(i => {
      const sub = i.cantidadAVender * i.precioUnitario;
      doc.text(
        `${i.nombre} — Cant: ${i.cantidadAVender}, Unit: $${i.precioUnitario.toFixed(2)}, Sub: $${sub.toFixed(2)}`
      ).moveDown(0.5);
    });

    doc.moveDown()
       .text(`Total: $${totalBruto.toFixed(2)}`)
       .text(`Descuento: $${descuento.toFixed(2)}`)
       .text(`Total Final: $${totalFinal.toFixed(2)}`, { underline: true });

    doc.end();

  } catch (err) {
    console.error("❌ Error en compra:", err);
    res.status(err.response?.status || 500).json({ error: "Error interno en la compra" });
  }
});


module.exports = router;
