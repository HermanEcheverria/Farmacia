const express = require("express");
const router = express.Router();
const Page = require("../models/Page");
const { verifyToken, verifyAdmin } = require("../utils/authMiddleware");


router.get("/admin", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const pages = await Page.find().lean();
      res.json(pages);
    } catch (error) {
      console.error("Error al obtener páginas para administración:", error);
      res.status(500).json({ error: "Error al obtener páginas" });
    }
  });


// Obtener todas las páginas (por ejemplo, para la navegación)
router.get("/", async (req, res) => {
  try {
    // Puedes filtrar por "enabled = true" si solo quieres mostrar las activas
    const pages = await Page.find({ enabled: true }).lean();
    res.json(pages);
  } catch (error) {
    console.error("Error al obtener páginas:", error);
    res.status(500).json({ error: "Error al obtener páginas" });
  }
});

// Obtener una página por slug
router.get("/:slug", async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, enabled: true }).lean();
    if (!page) {
      return res.status(404).json({ error: "Página no encontrada o deshabilitada" });
    }
    res.json(page);
  } catch (error) {
    console.error("Error al obtener página:", error);
    res.status(500).json({ error: "Error al obtener la página" });
  }
});

// Crear una página (solo Admin)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const newPage = new Page(req.body);
    await newPage.save();
    res.status(201).json(newPage);
  } catch (error) {
    console.error("Error al crear página:", error);
    res.status(400).json({ error: "Error al crear página" });
  }
});

// Actualizar una página por ID (solo Admin)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updated = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "Página no encontrada" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error al actualizar página:", error);
    res.status(400).json({ error: "Error al actualizar página" });
  }
});

// Eliminar (o deshabilitar) una página por ID (solo Admin)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Opción 1: Eliminar físicamente la página
    // const deleted = await Page.findByIdAndDelete(req.params.id);

    // Opción 2: Solo deshabilitar
    const deleted = await Page.findByIdAndUpdate(req.params.id, { enabled: false }, { new: true });
    if (!deleted) {
      return res.status(404).json({ error: "Página no encontrada" });
    }
    res.json({ message: "Página deshabilitada/eliminada", page: deleted });
  } catch (error) {
    console.error("Error al eliminar página:", error);
    res.status(400).json({ error: "Error al eliminar página" });
  }
});


module.exports = router;
