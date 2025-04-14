const os = require("os");
const express = require("express");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const dotenv = require("dotenv");
dotenv.config();

const { verifyToken } = require("../utils/authMiddleware");
const Medicamento = require("../models/Medicamento");
const Venta = require("../models/Venta");

const router = express.Router();

// API de aseguradora (forzado IPv4)
const ASEGURADORA_RECETAS_API_URL =
  process.env.ASEGURADORA_API_URL_recetas?.replace("localhost", "127.0.0.1") ||
  "http://127.0.0.1:5001/api/recetas";

// IP del hospital
const networkInterfaces = os.networkInterfaces();
let serverIp = "localhost";
for (const interfaceName in networkInterfaces) {
  for (const iface of networkInterfaces[interfaceName]) {
    if (!iface.internal && iface.family === "IPv4") {
      serverIp = iface.address;
      break;
    }
  }
}
const HOSPITAL_API_URL = `http://${serverIp}:8080`;

console.log(`🔗 API del Hospital detectada en: ${HOSPITAL_API_URL}`);
console.log(`🔗 API de Aseguradora: ${ASEGURADORA_RECETAS_API_URL}`);

// ✅ Solicitar receta
router.get("/solicitar/:codigo", verifyToken, async (req, res) => {
  try {
    const { codigo } = req.params;
    const token = req.headers.authorization;

    const response = await axios.get(`${HOSPITAL_API_URL}/recetas/${codigo}`, {
      headers: { Authorization: token },
    });

    if (!response.data) return res.status(404).json({ error: "Receta no encontrada" });

    const receta = response.data;
    const medicamentosDisponibles = [];
    let recetaCompleta = true;

    for (let item of receta.medicamentos) {
      const medData = item.medicamento || {};
      const id = medData.idMedicamento;
      const principio = medData.principioActivo || "Desconocido";
      const concentracion = medData.concentracion || "N/A";
      const cantidad = parseInt(item.dosis) || 1;

      let medicamento = await Medicamento.findOne({ idMedicamento: id });
      let unidades = medicamento?.unidadesPorPresentacion || medData.unidadesPorPresentacion || 1;

      if (medicamento && medicamento.stock >= cantidad) {
        medicamentosDisponibles.push({
          idMedicamento: id,
          nombre: principio,
          concentracion,
          presentacion: medicamento.presentacion,
          unidadesPorPresentacion: unidades,
          cantidad,
          disponible: true,
          precio_unitario: medicamento.precio
        });
      } else {
        const alternativo = await Medicamento.findOne({ principioActivo: principio, stock: { $gte: cantidad } });
        if (alternativo) {
          medicamentosDisponibles.push({
            idMedicamento: alternativo.idMedicamento,
            nombre: alternativo.principioActivo,
            concentracion: alternativo.concentracion,
            presentacion: alternativo.presentacion,
            unidadesPorPresentacion: alternativo.unidadesPorPresentacion,
            cantidad,
            disponible: true,
            precio_unitario: alternativo.precio
          });
        } else {
          recetaCompleta = false;
          medicamentosDisponibles.push({
            idMedicamento: id,
            nombre: principio,
            concentracion,
            presentacion: medData.presentacion || "N/A",
            unidadesPorPresentacion: unidades,
            cantidad,
            disponible: false,
            precio_unitario: medicamento?.precio || 0
          });
        }
      }
    }

    if (!recetaCompleta) {
      return res.status(400).json({
        error: "No se puede completar la receta por falta de medicamentos",
        medicamentos: medicamentosDisponibles,
      });
    }

    const montoCalculado = medicamentosDisponibles.reduce((acc, m) => acc + m.cantidad * (m.precio_unitario || 0), 0);
    const clienteId = req.user?._id || null;

    let validacionSeguro = null;
    try {
      const seguroRes = await axios.post(`${ASEGURADORA_RECETAS_API_URL}/validar`, {
        idReceta: codigo,
        farmacia: "Farmacia XYZ",
        monto: montoCalculado,
        clienteId
      });
      validacionSeguro = seguroRes.data;
    } catch (err) {
      console.warn("⚠️ No se pudo validar con la aseguradora:", err.message);
    }

    const descuento = validacionSeguro?.descuento || 0;
    const totalFinal = montoCalculado - descuento;

    return res.json({
      mensaje: validacionSeguro?.mensaje || "Receta disponible",
      medicamentos: medicamentosDisponibles,
      total: montoCalculado,
      descuento,
      totalFinal,
      estadoSeguro: validacionSeguro?.estado || "sin respuesta",
      infoDescuento: validacionSeguro?.infoDescuento || "No se aplicó descuento"
    });

  } catch (error) {
    console.error("❌ Error al solicitar receta:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Error interno del servidor" });
  }
});

// ✅ Comprar receta
router.post("/comprar", verifyToken, async (req, res) => {
  try {
    const { codigo } = req.body;
    const token = req.headers.authorization;

    const response = await axios.get(`${HOSPITAL_API_URL}/recetas/${codigo}`, {
      headers: { Authorization: token }
    });

    if (!response.data) return res.status(404).json({ error: "Receta no encontrada" });

    const receta = response.data;
    const medicamentosParaVenta = [];
    let recetaCompleta = true;

    for (let item of receta.medicamentos) {
      const med = item.medicamento || {};
      const id = med.idMedicamento;
      const principio = med.principioActivo || "Desconocido";
      const concentracion = med.concentracion || "N/A";
      const dosis = parseFloat(item.dosis) || 1;
      const frecuencia = parseInt(item.frecuencia) || 1;
      const duracion = parseInt(item.duracion) || 1;
      const dias = duracion * 30;
      const cantidadReq = Math.ceil(dosis * frecuencia * dias);

      let medicamento = await Medicamento.findOne({ idMedicamento: id });
      let unidades = medicamento ? medicamento.unidadesPorPresentacion : (parseInt(med.unidadesPorPresentacion) || 1);
      const cajas = Math.ceil(cantidadReq / unidades);
      const cantidadFinal = cajas * unidades;

      if (medicamento && medicamento.stock >= cantidadFinal) {
        medicamentosParaVenta.push({
          idMedicamento: id,
          nombre: principio,
          concentracion,
          presentacion: medicamento.presentacion,
          unidadesPorPresentacion: unidades,
          cantidadAVender: cantidadFinal,
          precioUnitario: medicamento.precio,
          medicamentoDoc: medicamento,
        });
      } else {
        const alternativo = await Medicamento.findOne({ principioActivo: principio, stock: { $gte: cantidadFinal } });
        if (alternativo) {
          medicamentosParaVenta.push({
            idMedicamento: alternativo.idMedicamento,
            nombre: alternativo.principioActivo,
            concentracion: alternativo.concentracion,
            presentacion: alternativo.presentacion,
            unidadesPorPresentacion: alternativo.unidadesPorPresentacion,
            cantidadAVender: cantidadFinal,
            precioUnitario: alternativo.precio,
            medicamentoDoc: alternativo,
          });
        } else {
          recetaCompleta = false;
          break;
        }
      }
    }

    if (!recetaCompleta) {
      return res.status(400).json({
        error: "No se puede completar la receta por falta de medicamentos",
        medicamentos: medicamentosParaVenta,
      });
    }

    let total = medicamentosParaVenta.reduce((sum, m) => sum + m.cantidadAVender * m.precioUnitario, 0);
    const clienteId = req.user._id;
    let descuento = 0;

    try {
      const seguroRes = await axios.post(`${ASEGURADORA_RECETAS_API_URL}/validar`, {
        idReceta: codigo,
        farmacia: "Farmacia XYZ",
        monto: total,
        clienteId
      });

      const validacion = seguroRes.data;
      if (validacion.estado === "aprobada") {
        descuento = validacion.descuento || 0;
      } else {
        return res.status(400).json({ error: validacion.mensaje || "No aprobado por seguro" });
      }
    } catch (error) {
      console.error("❌ Error aseguradora:", error.message);
      return res.status(500).json({ error: "No se pudo validar con la aseguradora" });
    }

    const totalFinal = total - descuento;

    for (let item of medicamentosParaVenta) {
      await Medicamento.updateOne(
        { idMedicamento: item.idMedicamento },
        { $inc: { stock: -item.cantidadAVender } }
      );
    }

    const venta = new Venta({
      medicamentos: medicamentosParaVenta.map(item => ({
        medicamentoId: item.medicamentoDoc._id,
        cantidad: item.cantidadAVender,
        precioUnitario: item.precioUnitario
      })),
      montoTotal: total,
      usuario: req.user._id
    });
    await venta.save();

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers).toString("base64");
      return res.json({
        mensaje: "Compra procesada exitosamente",
        total,
        descuento,
        totalFinal,
        pdfFactura: pdfData,
      });
    });

    doc.fontSize(18).text("Factura de Compra", { align: "center" }).moveDown();
    doc.strokeColor("#aaa").lineWidth(1).moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.options.margin, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Código de Receta: ${codigo}`, { align: "left" }).text(`Fecha: ${new Date().toLocaleString()}`).moveDown();
    doc.fontSize(14).text("Detalle de Medicamentos:", { underline: true }).moveDown(0.5);
    doc.fontSize(12);
    const tableTop = doc.y;
    doc.text("Medicamento", 50, tableTop);
    doc.text("Cantidad", 250, tableTop);
    doc.text("Precio Unit.", 350, tableTop);
    doc.text("Subtotal", 450, tableTop);
    doc.moveDown(0.5);
    doc.strokeColor("#ccc").lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();

    medicamentosParaVenta.forEach((item) => {
      const y = doc.y + 5;
      const subtotal = item.cantidadAVender * item.precioUnitario;
      doc.text(item.nombre, 50, y);
      doc.text(item.cantidadAVender.toString(), 250, y);
      doc.text(`$${item.precioUnitario}`, 350, y);
      doc.text(`$${subtotal}`, 450, y);
      doc.moveDown();
    });

    doc.moveDown(0.5).strokeColor("#ccc").lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(1);
    doc.fontSize(12);
    doc.text(`Total: $${total}`);
    doc.text(`Descuento: $${descuento}`);
    doc.text(`Total Final: $${totalFinal}`, { underline: true });

    doc.end();

  } catch (error) {
    console.error("❌ Error en compra:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Error interno en el proceso de compra" });
  }
});

module.exports = router;
