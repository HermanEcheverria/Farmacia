// routes/layoutRoutes.js
const express = require("express");
const router = express.Router();
const Layout = require("../models/Layout");
const LayoutDraft = require("../models/LayoutDraft");

// 1. Obtener el layout publicado
router.get("/", async (req, res) => {
  try {
    const layout = await Layout.findOne({});
    // Si no existe, se devuelve un layout por defecto
    if (!layout) {
      return res.json({
        navbarPosition: "top",
        sections: ["heroSection", "featuresSection", "footerSection"]
      });
    }
    res.json(layout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Crear un borrador de layout (cambios propuestos por el usuario)
// Se asume que req.body contiene { navbarPosition, sections }
router.post("/draft", async (req, res) => {
  try {
    // Si tienes autenticación, asegúrate de que req.user esté disponible
    const draft = new LayoutDraft({
      navbarPosition: req.body.navbarPosition,
      sections: req.body.sections,
      createdBy: req.user ? req.user._id : null
    });
    await draft.save();
    res.status(201).json(draft);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Listar todos los borradores (solo para administradores)
router.get("/drafts", async (req, res) => {
  try {
    // Verificar que el usuario sea administrador (esto depende de tu sistema de autenticación)
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    const drafts = await LayoutDraft.find({});
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Aprobar un borrador: se actualiza el layout publicado y se marca el borrador como "approved"
router.patch("/drafts/:id/approve", async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    const draft = await LayoutDraft.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({ error: "Borrador no encontrado" });
    }

    // Actualiza el layout publicado (si no existe, se crea uno)
    let layout = await Layout.findOne({});
    if (!layout) {
      layout = new Layout();
    }
    layout.navbarPosition = draft.navbarPosition;
    layout.sections = draft.sections;
    await layout.save();

    // Actualiza el borrador
    draft.status = "approved";
    draft.moderationComment = req.body.moderationComment || "";
    await draft.save();

    res.json({ message: "Borrador aprobado y layout actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Rechazar un borrador: se marca el borrador como "rejected" con un comentario opcional
router.patch("/drafts/:id/reject", async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    const draft = await LayoutDraft.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({ error: "Borrador no encontrado" });
    }
    draft.status = "rejected";
    draft.moderationComment = req.body.moderationComment || "";
    await draft.save();

    res.json({ message: "Borrador rechazado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
