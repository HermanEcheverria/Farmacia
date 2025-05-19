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

const { getHospitalUrls, getAseguradoraUrls } = require("../utils/discovery");
const router = express.Router();




/**
 * Helper: GET /recetas/:codigo en cada hospital hasta que uno responda
 */
async function fetchReceta(codigo, token) {
  let lastErr;
  // ← REEMPLAZA el bucle estático por uno dinámico:
  const hospitalUrls = await getHospitalUrls();
  if (hospitalUrls.length === 0) {
    throw new Error("No hay hospitales registrados");
  }
  for (const base of hospitalUrls) {
    try {
      const { data } = await axios.get(
        `${base}/recetas/${codigo}`,
        { headers: { Authorization: token } }
      );
      return data;
    } catch (err) {
      lastErr = err;
      if (err.code === "ECONNREFUSED") continue;
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
  const aseguradoraUrls = await getAseguradoraUrls();
  if (aseguradoraUrls.length === 0) {
    throw new Error("No hay aseguradoras registradas");
  }

  for (const base of aseguradoraUrls) {
    try {
      return await axios.post(
        `${base}${path}`,
        payload,
        { headers: { Authorization: token, "Content-Type": "application/json" } }
      );
    } catch (err) {
      lastErr = err;

      // Si no responde (ej: servicio caído), probar siguiente
      if (err.code === "ECONNREFUSED") continue;

      // Si no existe el afiliado en esta aseguradora (404), probar siguiente
      if (err.response?.status === 404) continue;

      // Si la aseguradora ya validó la receta (409), devolvemos el error de inmediato
      if (err.response?.status === 409) throw err;

      // Cualquier otro error HTTP aborta
      if (err.response) throw err;
    }
  }

  // Ninguna aseguradora pudo procesar
  throw lastErr || new Error("Ninguna aseguradora respondió");
}


/**
 * GET /solicitar/:codigo
 */
router.get("/solicitar/:codigo", verifyToken, async (req, res) => {
  try {
    const { codigo }       = req.params;
    const token            = req.headers.authorization;
    const numeroAfiliacion = req.query.numeroAfiliacion;
    // CONVERSIÓN CORRECTA a booleano:
    const tieneSeguro = req.query.tieneSeguro === "true";

    console.log("tieneSeguro:", tieneSeguro);

    // 1) Traer receta
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
        meds.push({ idMedicamento: id, nombre: m.principioActivo, cantidad: cant, disponible: true,
                    presentacion: doc.presentacion, unidadesPorPresentacion: un, precio_unitario: doc.precio });
      } else {
        const alt = await Medicamento.findOne({ principioActivo: m.principioActivo, stock: { $gte: cant } });
        if (alt) {
          meds.push({ idMedicamento: alt.idMedicamento, nombre: alt.principioActivo, cantidad: cant, disponible: true,
                      presentacion: alt.presentacion, unidadesPorPresentacion: alt.unidadesPorPresentacion, precio_unitario: alt.precio });
        } else {
          completa = false;
          meds.push({ idMedicamento: id, nombre: m.principioActivo, cantidad: cant, disponible: false,
                      presentacion: m.presentacion||"N/A", unidadesPorPresentacion: un, precio_unitario: doc?.precio||0 });
        }
      }
    }
    if (!completa) {
      return res.status(400).json({ error: "Faltan medicamentos", medicamentos: meds });
    }

    // 3) Calcular total bruto
    const total = meds.reduce((s, m) => s + m.cantidad * (m.precio_unitario||0), 0);

    // 4–5) Registro y validación sólo si realmente tieneSeguro === true
    let estado = "SIN_SEGURO", descuento = 0, mensaje = null, infoDescuento = null;
    if (tieneSeguro) {
      console.log("Entrando al flujo de aseguradora");
      const urls = await getAseguradoraUrls();
      if (urls.length) {
        // registro
        try {
          await postAseguradora("/recetas",
            { codigo, cliente: receta.idPaciente, farmacia: "MiFarmacia", total },
            token
          );
        } catch (err) {
          if (err.response?.status !== 409) console.warn("Registro receta falló:", err.message);
        }
        // validación
        const payload = { codigo, farmacia: "MiFarmacia", total };
        if (numeroAfiliacion) payload.numeroAfiliacion = numeroAfiliacion;
        try {
          const resp = await postAseguradora("/recetas/validar", payload, token);
          ({ estado, descuento=0, mensaje, infoDescuento } = resp.data);
        } catch (err) {
          console.warn("Validación en aseguradora falló:", err.message);
        }
      } else {
        console.warn("No hay aseguradoras configuradas: omitiendo seguro");
      }
    }

    const totalFinal = total - descuento;

    // 6) Guardar/upsert
    await RecetaAseg.findOneAndUpdate(
      { codigo },
      {
        codigo,
        paciente: receta.nombrePaciente,
        medicamentos: meds.map(m => ({
          codigo: String(m.idMedicamento),
          nombre: m.nombre,
          principioActivo: m.nombre,
          cantidad: m.cantidad,
          dosis: String(m.cantidad),
          frecuencia: "N/A",
          duracionDias: 0
        })),
        fechaEmision: new Date(),
        total, descuento, totalFinal,
        estadoSeguro: estado
      },
      { upsert: true, new: true }
    );

    // 7) Responder
    return res.json({
      codigo,
      idPaciente: receta.idPaciente,
      nombrePaciente: receta.nombrePaciente,
      medicamentos: meds,
      total, descuento, totalFinal, estadoSeguro: estado, mensaje, infoDescuento
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
        medsVenta.push({
          medicamentoDoc: doc,
          cantidadAVender: cant,
          precioUnitario: doc.precio,
          nombre: m.principioActivo,
          idMedicamento: id
        });
      } else {
        const alt = await Medicamento.findOne({
          principioActivo: m.principioActivo,
          stock: { $gte: cant }
        });
        if (alt) {
          medsVenta.push({
            medicamentoDoc: alt,
            cantidadAVender: cant,
            precioUnitario: alt.precio,
            nombre: alt.principioActivo,
            idMedicamento: alt.idMedicamento
          });
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
      const payload = {
        codigo,
        farmacia: "MiFarmacia",   // o usa tu variable de config
        total: totalBruto
      };
      if (numeroAfiliacion) payload.numeroAfiliacion = numeroAfiliacion;

      try {
        const secRes = await postAseguradora(
          "/recetas/validar",      // ← ruta corregida
          payload,
          token
        );
        descuento = secRes.data.descuento || 0;
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn("Afiliado no encontrado en ninguna aseguradora — sin descuento");
        } else {
          console.error("Validación en compra falló:", err.message);
        }
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
