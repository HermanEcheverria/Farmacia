// farmacia-backend/routes/recetasRoutes.js

const express     = require("express");
const axios       = require("axios");
const PDFDocument = require("pdfkit");
const dotenv      = require("dotenv");
dotenv.config();

const { verifyToken } = require("../utils/authMiddleware");
const Medicamento  = require("../models/Medicamento");
const Venta        = require("../models/Venta");
const RecetaAseg   = require("../models/Receta");

const router = express.Router();

/**
 * Descubrimiento dinámico de endpoints desde el .env
 */
const hospitalUrls = Object
  .entries(process.env)
  .filter(([k]) => k.startsWith("HOSPITAL") && k.endsWith("_API_URL"))
  .map(([, url]) => url.replace(/\/+$/, ""));

const aseguradoraUrls = Object
  .entries(process.env)
  .filter(([k]) => k.startsWith("ASEGURADORA") && k.endsWith("_API_URL_RECETAS"))
  .map(([, url]) => url.replace(/\/+$/, ""));

/**
 * Helper: GET /recetas/:codigo en cada hospital hasta que uno responda
 */
async function fetchReceta(codigo, token) {
  let lastErr;
  for (const base of hospitalUrls) {
    try {
      const { data } = await axios.get(
        `${base}/recetas/${codigo}`,
        { headers: { Authorization: token } }
      );
      return data;
    } catch (err) {
      lastErr = err;
      // si es conexión rechazada, seguir intentando en otro hospital
      if (err.code === "ECONNREFUSED") continue;
      // si responde 404, dejamos de buscar y devolvemos not found
      if (err.response?.status === 404) throw err;
    }
  }
  throw lastErr || new Error("Ningún hospital respondió");
}

/**
 * Helper: POST a /api/recetas y /api/recetas/validar en cada aseguradora
 */
async function postAseguradora(path, payload, token) {
  let lastErr;
  for (const base of aseguradoraUrls) {
    try {
      return await axios.post(
        `${base}${path}`,
        payload,
        { headers: { Authorization: token, "Content-Type": "application/json" } }
      );
    } catch (err) {
      lastErr = err;
      // conexión rechazada → probar siguiente aseguradora
      if (err.code === "ECONNREFUSED") continue;
      // conflicto 409 lo dejamos subir para que lo maneje el llamador
      if (err.response?.status === 409) throw err;
      // otros errores HTTP (4xx,5xx) abortan
      if (err.response) throw err;
    }
  }
  throw lastErr || new Error("Ninguna aseguradora respondió");
}

/**
 * GET /solicitar/:codigo
 */
router.get("/solicitar/:codigo", verifyToken, async (req, res) => {
  try {
    const { codigo }       = req.params;
    const token            = req.headers.authorization;
    const numeroAfiliacion = req.query.numeroAfiliacion; // opcional

    // 1) Traer receta de cualquier hospital
    const receta = await fetchReceta(codigo, token);
    if (!receta) return res.status(404).json({ error: "Receta no encontrada" });

    // 2) Verificar stock y alternativas
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

    // 4) Registrar en aseguradora (ignorar conflicto y continúe si alguna falla)
    try {
      await postAseguradora(
        "",
        { codigo, cliente: receta.idPaciente, farmacia: "Farmacia Verde", total },
        token
      );
    } catch (err) {
      if (err.response?.status !== 409) console.warn("Registro receta falló:", err.message);
    }

    // 5) Validar en aseguradora
    let validarPayload = { codigo, farmacia: "Farmacia Verde", total };
    if (numeroAfiliacion) validarPayload.numeroAfiliacion = numeroAfiliacion;

    let seguroResp;
    try {
      seguroResp = await postAseguradora("/validar", validarPayload, token);
    } catch (err) {
      console.error("Validación en aseguradora falló:", err.message);
      return res.status(502).json({ error: "No se pudo validar con ninguna aseguradora" });
    }

    const { estado, descuento = 0, mensaje, infoDescuento } = seguroResp.data;
    const totalFinal = total - descuento;

    // 6) Upsert en nuestra BD de farmacia
    await RecetaAseg.findOneAndUpdate(
      { codigo },
      {
        codigo,
        paciente: receta.nombrePaciente,
        medicamentos: meds.map(m => ({
          codigo:          String(m.idMedicamento),
          nombre:          m.nombre,
          principioActivo: m.nombre,
          cantidad:        m.cantidad,
          dosis:           String(m.cantidad),
          frecuencia:      "N/A",
          duracionDias:    0
        })),
        fechaEmision: new Date(),
        total,
        descuento,
        totalFinal,
        estadoSeguro: estado
      },
      { upsert: true, new: true }
    );

    // 7) Devolver al frontend
    return res.json({
      codigo,
      idPaciente:     receta.idPaciente,
      nombrePaciente: receta.nombrePaciente,
      medicamentos:   meds,
      total,
      descuento,
      totalFinal,
      estadoSeguro:   estado,
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
 */
router.post("/comprar", verifyToken, async (req, res) => {
  try {
    const { codigo, tieneSeguro, numeroAfiliacion } = req.body;
    const token = req.headers.authorization;

    // 1) Obtener receta
    const receta = await fetchReceta(codigo, token);
    if (!receta) return res.status(404).json({ error: "Receta no encontrada" });

    // 2) Preparar items de venta
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

    // 4) Validar descuento
    let descuento = 0;
    if (tieneSeguro) {
      const payload = { codigo, farmacia: "Farmacia Verde", total: totalBruto };
      if (numeroAfiliacion) payload.numeroAfiliacion = numeroAfiliacion;
      try {
        const secRes = await postAseguradora("/validar", payload, token);
        descuento = secRes.data.descuento || 0;
      } catch (err) {
        console.error("Validación en compra falló:", err.message);
      }
    }
    const totalFinal = totalBruto - descuento;

    // 5) Actualizar stock y guardar venta
    for (const i of medsVenta) {
      await Medicamento.updateOne(
        { idMedicamento: i.idMedicamento },
        { $inc: { stock: -i.cantidadAVender } }
      );
    }
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

    // 6) Generar PDF
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
