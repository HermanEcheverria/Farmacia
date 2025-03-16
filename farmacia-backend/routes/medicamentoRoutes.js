const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFSBucket = require("mongodb").GridFSBucket;
const Medicamento = require("../models/Medicamento");
const { verifyToken, verifyAdmin } = require("../utils/authMiddleware");

const router = express.Router();

//  Inicializar GridFSBucket 
const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  gfs = new GridFSBucket(conn.db, { bucketName: "uploads" });
});

//  Configuración de almacenamiento en memoria para Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

//  Ruta de prueba
router.get("/", (req, res) => {
  res.json({ mensaje: "Ruta de medicamentos funcionando!" });
});

// Obtener todos los medicamentos
router.get("/listar", async (req, res) => {
  try {
    const medicamentos = await Medicamento.find();
    res.json(medicamentos);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo medicamentos" });
  }
});

//  Obtener un medicamento por código
router.get("/:codigo", async (req, res) => {
  try {
    const medicamento = await Medicamento.findOne({ codigo: req.params.codigo });
    if (!medicamento) return res.status(404).json({ error: "Medicamento no encontrado" });
    res.json(medicamento);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo medicamento" });
  }
});

//  Crear un nuevo medicamento (Solo Admins)
router.post("/crear", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const medicamento = new Medicamento(req.body);
    await medicamento.save();
    res.status(201).json(medicamento);
  } catch (error) {
    res.status(400).json({ error: "Error creando medicamento" });
  }
});

// Actualizar medicamento (Solo Admins)
router.put("/actualizar/:codigo", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const medicamento = await Medicamento.findOneAndUpdate(
      { codigo: req.params.codigo },
      req.body,
      { new: true }
    );
    if (!medicamento) return res.status(404).json({ error: "Medicamento no encontrado" });
    res.json(medicamento);
  } catch (error) {
    res.status(400).json({ error: "Error actualizando medicamento" });
  }
});

// Eliminar medicamento (Solo Admins)
router.delete("/eliminar/:codigo", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const medicamento = await Medicamento.findOneAndDelete({ codigo: req.params.codigo });
    if (!medicamento) return res.status(404).json({ error: "Medicamento no encontrado" });
    res.json({ message: "Medicamento eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error eliminando medicamento" });
  }
});

// Subir imagen de medicamento a GridFS (Solo Admins)
router.post("/upload/:codigo", verifyToken, verifyAdmin, upload.single("imagen"), async (req, res) => {
  try {
    const medicamento = await Medicamento.findOne({ codigo: req.params.codigo });
    if (!medicamento) return res.status(404).json({ error: "Medicamento no encontrado" });

    if (!gfs) return res.status(500).json({ error: "GridFS no inicializado" });

    const filename = `${Date.now()}-${req.file.originalname}`;
    const uploadStream = gfs.openUploadStream(filename, {
      contentType: req.file.mimetype,
    });

    uploadStream.end(req.file.buffer);
    uploadStream.on("finish", async () => {
      medicamento.fotos.push(filename);
      await medicamento.save();
      res.json({ message: "Imagen subida con éxito", fotos: medicamento.fotos });
    });

  } catch (error) {
    res.status(500).json({ error: "Error al subir imagen" });
  }
});

//  Obtener una imagen de GridFS
router.get("/image/:filename", async (req, res) => {
  try {
    if (!gfs) return res.status(500).json({ error: "GridFS no inicializado" });

    gfs.find({ filename: req.params.filename }).toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({ error: "Imagen no encontrada" });
      }

      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo la imagen" });
  }
});

module.exports = router;
