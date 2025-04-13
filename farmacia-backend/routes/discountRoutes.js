const express = require("express");
const DiscountRequest = require("../models/DiscountRequest");
const Medicamento = require("../models/Medicamento");
// ... middlewares de autenticación y autorización si es necesario ...
const router = express.Router();

// Endpoint para solicitar un descuento en un medicamento (por Farmacia)
router.post("/solicitar", async (req, res) => {
  try {
    const { medicamentoId, farmacia, porcentajeDescuento } = req.body;
    if (!medicamentoId || !farmacia || !porcentajeDescuento) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }
    const medicamento = await Medicamento.findById(medicamentoId);
    if (!medicamento) {
      return res.status(404).json({ error: "Medicamento no encontrado" });
    }
    const nuevaSolicitud = new DiscountRequest({
      medicamento: medicamentoId,
      farmacia,
      porcentajeDescuento
    });
    await nuevaSolicitud.save();
    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    console.error("❌ Error al solicitar descuento:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

// Endpoint para listar solicitudes pendientes (para el sistema de Aseguradora)
router.get("/listar", async (req, res) => {
    try {
      const estado = req.query.estado; // puede ser "pendiente", "aprobado", "rechazado", o no enviar para todas
      const filtro = estado ? { estado } : {};
      const solicitudes = await DiscountRequest.find(filtro)
        .populate("medicamento", "nombre") // Poblamos solo el campo "nombre" del medicamento
        .select("farmacia porcentajeDescuento medicamento estado");
      res.json(solicitudes);
    } catch (error) {
      console.error("Error listando solicitudes de descuento:", error);
      res.status(500).json({ error: "Error interno en el servidor" });
    }
  });
  

// Endpoint para procesar (aprobar o rechazar) una solicitud
router.post("/procesar/:id", async (req, res) => {
  try {
    const { aprobar, nuevoDescuento } = req.body;
    const solicitud = await DiscountRequest.findById(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }
    if (solicitud.estado !== "pendiente") {
      return res.status(400).json({ error: "La solicitud ya fue procesada" });
    }

    solicitud.estado = aprobar ? "aprobado" : "rechazado";
    await solicitud.save();

    // Si se aprueba, se actualiza el medicamento con el descuento concedido
    if (aprobar) {
      await Medicamento.findByIdAndUpdate(solicitud.medicamento, { $set: { descuento: nuevoDescuento } });
    }

    res.json(solicitud);
  } catch (error) {
    console.error("❌ Error al procesar solicitud:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

module.exports = router;
