const os = require("os");
const express = require("express");
const { verifyToken } = require("../utils/authMiddleware");
const Medicamento = require("../models/Medicamento"); // MongoDB
const axios = require("axios");

const router = express.Router();

// Obtener la IP del servidor para la API del hospital
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

// API del hospital
const HOSPITAL_API_URL = `http://${serverIp}:8080`;
console.log(`🔗 API del Hospital detectada en: ${HOSPITAL_API_URL}`);

// **📌 Endpoint para solicitar una receta**
router.get("/solicitar/:codigo", verifyToken, async (req, res) => {
  try {
    const { codigo } = req.params;
    console.log(`🔍 Buscando receta con código: ${codigo}`);

    // **📌 Obtener el token del usuario autenticado**
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "No autorizado. Inicia sesión nuevamente." });
    }

    // **📌 Consultar la receta en el sistema de hospitales (Oracle)**
    const response = await axios.get(`${HOSPITAL_API_URL}/recetas/${codigo}`, {
      headers: { Authorization: token },
    });

    if (!response.data) {
      console.error("❌ Receta no encontrada en el sistema del hospital.");
      return res.status(404).json({ error: "Receta no encontrada" });
    }

    const receta = response.data;
    console.log("✅ Receta obtenida:", JSON.stringify(receta, null, 2));

    // **📌 Validar disponibilidad en la farmacia (MongoDB)**
    const medicamentosDisponibles = [];
    let recetaCompleta = true;

    for (let item of receta.medicamentos) {
      // **📌 Extraer información del medicamento correctamente**
      const medicamentoData = item.medicamento || {};
      if (!medicamentoData.idMedicamento) {
        console.warn(`⚠️ No se encontró información del medicamento en la receta: ${JSON.stringify(item, null, 2)}`);
        recetaCompleta = false;
        continue;
      }

      const idMedicamento = medicamentoData.idMedicamento;
      const principioActivo = medicamentoData.principioActivo || "Desconocido";
      const concentracion = medicamentoData.concentracion || "N/A";
      const presentacion = medicamentoData.presentacion || "N/A";
      const cantidad = parseInt(item.dosis) || 1; // Suponemos que `dosis` es la cantidad necesaria

      console.log(`🔍 Buscando medicamento en la farmacia: ${principioActivo} (ID: ${idMedicamento})`);

      // **📌 Buscar en la farmacia por ID del medicamento**
      const medicamento = await Medicamento.findOne({ idMedicamento });

      if (medicamento && medicamento.stock >= cantidad) {
        medicamentosDisponibles.push({
          idMedicamento,
          nombre: principioActivo,
          concentracion,
          presentacion,
          cantidad,
          disponible: true
        });
      } else {
        // **📌 Buscar alternativa con el mismo principio activo**
        const alternativo = await Medicamento.findOne({
          principioActivo,
          stock: { $gte: cantidad }
        });

        if (alternativo) {
          console.log(`✅ Alternativa encontrada: ${alternativo.principioActivo} (${alternativo.codigo})`);
          medicamentosDisponibles.push({
            idMedicamento: alternativo.idMedicamento,
            nombre: alternativo.principioActivo,
            concentracion: alternativo.concentracion,
            presentacion: alternativo.presentacion,
            cantidad,
            disponible: true
          });
        } else {
          console.warn(`⚠️ Medicamento agotado y sin alternativa: ${principioActivo}`);
          recetaCompleta = false;
          medicamentosDisponibles.push({
            idMedicamento,
            nombre: principioActivo,
            concentracion,
            presentacion,
            cantidad,
            disponible: false
          });
        }
      }
    }

    // **📌 Si no se puede completar la receta, notificar al usuario**
    if (!recetaCompleta) {
      return res.status(400).json({
        error: "No se puede completar la receta por falta de medicamentos",
        medicamentos: medicamentosDisponibles,
      });
    }

    // **📌 Si la receta puede completarse, enviar la lista de medicamentos disponibles**
    return res.json({
      mensaje: "Receta disponible para compra",
      medicamentos: medicamentosDisponibles,
    });

  } catch (error) {
    console.error("❌ Error al procesar la solicitud de receta:", error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Error interno del servidor" });
  }
});

module.exports = router;
