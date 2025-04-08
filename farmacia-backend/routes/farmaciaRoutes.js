// routes/farmaciaRoutes.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

// Importa el modelo de la solicitud de farmacia
const SolicitudFarmacia = require("../models/SolicitudFarmacia");

// Endpoint para actualizar una solicitud en el sistema de Farmacia
router.put("/solicitudes/:id", async (req, res) => {
  try {
    const updatedSolicitud = await SolicitudFarmacia.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedSolicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    res.json(updatedSolicitud);
  } catch (err) {
    console.error("Error actualizando solicitud en Farmacia:", err);
    res.status(500).json({ error: "Error actualizando solicitud", details: err.message });
  }
});

// Endpoint POST ya existente para crear una solicitud y enviarla a Aseguradora
router.post("/solicitudes", async (req, res) => {
  try {
    // Guarda la solicitud localmente en MongoDB
    const solicitud = new SolicitudFarmacia(req.body);
    const savedSolicitud = await solicitud.save();
    
    // Agrega el campo "origen" para identificar que proviene de Farmacia
    const payload = {
      ...req.body,
      origen: "farmacia"
    };
    
    // Envía la solicitud al endpoint de la Aseguradora
    const urlAseguradora = process.env.ASEGURADORA_API_URL || "http://localhost:5001/api/solicitudes";
    const respuestaAseguradora = await axios.post(urlAseguradora, payload);
    
    // Devuelve la respuesta combinada
    res.status(201).json({
      local: savedSolicitud,
      aseguradora: respuestaAseguradora.data
    });
  } catch (error) {
    console.error("Error creando y enviando solicitud:", error);
    res.status(500).json({ message: "Error al procesar la solicitud", error });
  }
});

module.exports = router;
