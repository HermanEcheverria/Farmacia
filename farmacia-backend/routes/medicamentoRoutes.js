const express = require("express");
const Medicamento = require("../models/Medicamento");
const { verifyToken, verifyAdmin } = require("../utils/authMiddleware");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");

const router = express.Router();

// Configuración de GridFS Storage
const storage = new GridFsStorage({
  url: process.env.MONGO_URI || "mongodb://CruzVerde:Unis@137.184.71.127:27018/farmacia?authSource=admin",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: "uploads", // Nombre del bucket en GridFS
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});

const upload = multer({ storage });

// 🔹 Obtener todos los medicamentos
router.get("/listar", async (req, res) => {  // 📌 Antes: `router.get("/")`, ahora `/listar`
  try {
    const medicamentos = await Medicamento.find();
    res.json(medicamentos);
  } catch (error) {
    console.error("❌ Error obteniendo medicamentos:", error);
    res.status(500).json({ error: "Error obteniendo medicamentos" });
  }
});

// 🔹 Crear un nuevo medicamento (Solo Admins)
router.post("/crear", verifyToken, verifyAdmin, async (req, res) => {  // 📌 Antes: `router.post("/")`, ahora `/crear`
  try {
    console.log("🔍 Recibiendo datos en backend:", req.body);

    // Verificar si los campos están en req.body
    if (!req.body.presentacion || !req.body.concentracion || !req.body.principioActivo) {
      console.error("❌ Faltan campos obligatorios en la solicitud:", req.body);
      return res.status(400).json({ error: "Faltan campos obligatorios en la solicitud" });
    }

    // Crear instancia de medicamento
    const nuevoMedicamento = new Medicamento(req.body);
    console.log("🔍 Medicamento antes de guardar en MongoDB:", nuevoMedicamento);

    await nuevoMedicamento.save();
    console.log("✅ Medicamento guardado exitosamente en MongoDB");

    res.status(201).json(nuevoMedicamento);
  } catch (error) {
    console.error("❌ Error creando medicamento:", error);
    res.status(400).json({ error: error.errors || error.message || "Error creando medicamento" });
  }
});

// 🔹 Actualizar un medicamento por código (Solo Admins)
router.put("/:codigo", verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log("🔍 Actualizando medicamento con código:", req.params.codigo);
    const medicamentoActualizado = await Medicamento.findOneAndUpdate(
      { codigo: req.params.codigo },
      req.body,
      { new: true }
    );

    if (!medicamentoActualizado) {
      return res.status(404).json({ error: "Medicamento no encontrado" });
    }

    console.log("✅ Medicamento actualizado:", medicamentoActualizado);
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

// 🔹 Subir una imagen de medicamento
router.post("/upload/:codigo", verifyToken, verifyAdmin, upload.single("imagen"), async (req, res) => {
  try {
    const medicamento = await Medicamento.findOne({ codigo: req.params.codigo });

    if (!medicamento) {
      return res.status(404).json({ error: "Medicamento no encontrado" });
    }

    medicamento.fotos.push(req.file.id); // Guardar el ID del archivo en GridFS
    await medicamento.save();

    res.json({ message: "Imagen subida con éxito", fileId: req.file.id });
  } catch (error) {
    console.error("❌ Error subiendo imagen:", error);
    res.status(400).json({ error: "Error subiendo imagen" });
  }
});

module.exports = router;
