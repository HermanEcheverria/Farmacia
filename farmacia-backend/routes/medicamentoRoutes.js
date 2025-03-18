const express = require("express");
const mongoose = require("mongoose");
const Medicamento = require("../models/Medicamento");
const Comentario = require("../models/Comentario");
const User = require("../models/User");
const { verifyToken, verifyAdmin } = require("../utils/authMiddleware");
const { allowComment } = require("../utils/allowComment");

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

router.get("/buscar", async (req, res) => {
  try {
    const { nombre, principioActivo, descripcion, categoria } = req.query;
    const filtros = {};

    if (nombre) filtros.nombre = new RegExp(nombre, "i");
    if (principioActivo) filtros.principioActivo = new RegExp(principioActivo, "i");
    if (descripcion) filtros.descripcion = new RegExp(descripcion, "i");
    if (categoria) filtros.categoria = new RegExp(categoria, "i");

    const medicamentos = await Medicamento.find(filtros);
    res.json(medicamentos);
  } catch (error) {
    console.error("❌ Error en búsqueda de medicamentos:", error);
    res.status(500).json({ error: "Error al buscar medicamentos" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    console.log("🔍 Buscando medicamento con ID:", req.params.id);
    const medicamento = await Medicamento.findById(req.params.id).lean();
    if (!medicamento) {
      return res.status(404).json({ error: "Medicamento no encontrado" });
    }
    res.json(medicamento);
  } catch (error) {
    console.error("❌ Error obteniendo medicamento:", error);
    res.status(500).json({ error: "Error al obtener medicamento" });
  }
});

// 🔹 Obtener la jerarquía de comentarios para un medicamento
router.get("/:id/comentarios", async (req, res) => {
  try {
    const medicamentoId = req.params.id;
    // Se buscan todos los comentarios asociados al medicamento
    const comentarios = await Comentario.find({ medicamento: medicamentoId })
      .populate("user", "email") // Poblar el campo "user" con el email
      .lean();

    // Función recursiva para construir el árbol de comentarios
    const buildTree = (comentarios, parentId = null) => {
      return comentarios
        .filter((comentario) =>
          parentId === null
            ? comentario.parentId === null
            : comentario.parentId &&
              comentario.parentId.toString() === parentId.toString()
        )
        .map((comentario) => ({
          ...comentario,
          respuestas: buildTree(comentarios, comentario._id),
        }));
    };

    const tree = buildTree(comentarios);
    res.json(tree);
  } catch (error) {
    console.error("❌ Error obteniendo comentarios anidados:", error);
    res.status(500).json({ error: "Error al obtener comentarios anidados" });
  }
});

// 🔹 Agregar un comentario o respuesta (Solo para usuarios permitidos)
router.post("/:id/comentarios", verifyToken, allowComment, async (req, res) => {
  try {
    const { texto, respuestaA } = req.body;
    const medicamentoId = req.params.id;

    if (!texto) {
      return res.status(400).json({ error: "El comentario no puede estar vacío" });
    }

    const nuevoComentario = new Comentario({
      user: req.user.id,           // Se asigna el usuario autenticado (desde verifyToken)
      medicamento: medicamentoId,
      texto,
      parentId: respuestaA || null, // Si es respuesta, se asigna; si no, null (comentario raíz)
    });

    await nuevoComentario.save();
    res.status(201).json(nuevoComentario);
  } catch (error) {
    console.error("❌ Error agregando comentario:", error);
    res.status(500).json({ error: "Error agregando comentario" });
  }
});

module.exports = router;