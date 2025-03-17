const express = require("express");
const Medicamento = require("../models/Medicamento");
const { verifyToken, verifyAdmin } = require("../utils/authMiddleware");

const router = express.Router();

// 🔹 Obtener todos los medicamentos
router.get("/listar", async (req, res) => {  
  try {
    const medicamentos = await Medicamento.find();
    res.json(medicamentos);
  } catch (error) {
    console.error("❌ Error obteniendo medicamentos:", error);
    res.status(500).json({ error: "Error obteniendo medicamentos" });
  }
});

// 🔹 Crear un nuevo medicamento (Solo Admins)
router.post("/crear", verifyToken, verifyAdmin, async (req, res) => {  
  try {
    console.log("🔍 Recibiendo datos en backend:", req.body);

    // Validar que fotos sea un array de URLs
    if (!req.body.fotos || !Array.isArray(req.body.fotos)) {
      return res.status(400).json({ error: "El campo 'fotos' debe ser un array de URLs" });
    }

    // Crear instancia de medicamento
    const nuevoMedicamento = new Medicamento(req.body);
    await nuevoMedicamento.save();

    console.log("✅ Medicamento guardado con imágenes:", nuevoMedicamento);
    res.status(201).json(nuevoMedicamento);
  } catch (error) {
    console.error("❌ Error creando medicamento:", error);
    res.status(400).json({ error: "Error creando medicamento" });
  }
});

// 🔹 Actualizar un medicamento por código (Solo Admins)
router.put("/:codigo", verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log("🔍 Actualizando medicamento con código:", req.params.codigo);
    
    // Validar que fotos sea un array de URLs
    if (req.body.fotos && !Array.isArray(req.body.fotos)) {
      return res.status(400).json({ error: "El campo 'fotos' debe ser un array de URLs" });
    }

    const medicamentoActualizado = await Medicamento.findOneAndUpdate(
      { codigo: req.params.codigo },
      req.body,
      { new: true }
    );

    if (!medicamentoActualizado) {
      return res.status(404).json({ error: "Medicamento no encontrado" });
    }

    console.log("✅ Medicamento actualizado con imágenes:", medicamentoActualizado);
    res.json(medicamentoActualizado);
  } catch (error) {
    console.error("❌ Error actualizando medicamento:", error);
    res.status(400).json({ error: "Error actualizando medicamento" });
  }
});

// 🔹 Eliminar un medicamento por código (Solo Admins)
router.delete("/:codigo", verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log("🔍 Eliminando medicamento con código:", req.params.codigo);
    const medicamentoEliminado = await Medicamento.findOneAndDelete({ codigo: req.params.codigo });

    if (!medicamentoEliminado) {
      return res.status(404).json({ error: "Medicamento no encontrado" });
    }

    console.log("✅ Medicamento eliminado:", medicamentoEliminado);
    res.json({ message: "Medicamento eliminado" });
  } catch (error) {
    console.error("❌ Error eliminando medicamento:", error);
    res.status(400).json({ error: "Error eliminando medicamento" });
  }
});

module.exports = router;
