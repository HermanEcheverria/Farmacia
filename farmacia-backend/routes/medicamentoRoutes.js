const express = require("express");
const Medicamento = require("../models/Medicamento");
const Comentario = require("../models/Comentario");
const User = require("../models/User");
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

// 🔹 Obtener detalles de un medicamento con comentarios
router.get("/:id", async (req, res) => {
  try {
    console.log("🔍 Buscando medicamento con ID:", req.params.id);

    const medicamento = await Medicamento.findById(req.params.id)
      .populate({
        path: "comentarios",
        populate: [
          { path: "user", select: "email role" }, // Cargar usuario del comentario
          { 
            path: "respuestas", 
            populate: { path: "user", select: "email role" } // Cargar respuestas anidadas
          }
        ]
      });

    if (!medicamento) {
      console.log("⚠️ Medicamento no encontrado");
      return res.status(404).json({ error: "Medicamento no encontrado" });
    }

    console.log("✅ Medicamento encontrado:", medicamento);
    res.json(medicamento);
  } catch (error) {
    console.error("❌ Error obteniendo medicamento:", error);
    res.status(500).json({ error: "Error al obtener medicamento" });
  }
});



// 🔹 Agregar un comentario (Solo usuarios registrados)
router.post("/:id/comentarios", verifyToken, async (req, res) => {
  try {
    const { texto, respuestaA } = req.body;
    const { id: medicamentoId } = req.params;

    if (!texto) {
      return res.status(400).json({ error: "El comentario no puede estar vacío" });
    }

    console.log("🔍 Usuario autenticado:", req.user);

    const nuevoComentario = new Comentario({
      user: req.user.id,
      medicamento: medicamentoId,
      texto,
      respuestas: [] // 🔹 Asegurar que el nuevo comentario siempre tenga este campo
    });

    await nuevoComentario.save();

    if (respuestaA) {
      const comentarioPadre = await Comentario.findById(respuestaA);
      if (!comentarioPadre) return res.status(404).json({ error: "Comentario padre no encontrado." });

      comentarioPadre.respuestas.push(nuevoComentario._id);
      await comentarioPadre.save();
    } else {
      await Medicamento.findByIdAndUpdate(medicamentoId, {
        $push: { comentarios: nuevoComentario._id }
      });
    }

    res.status(201).json(nuevoComentario);
  } catch (error) {
    console.error("❌ Error agregando comentario:", error);
    res.status(500).json({ error: "Error agregando comentario" });
  }
});



module.exports = router;
