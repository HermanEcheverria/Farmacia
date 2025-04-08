const express = require("express");
const router = express.Router();
const ModeracionPage = require("../models/Moderacion");
const Page = require("../models/Page");

// 1. Crear propuesta
router.post("/", async (req, res) => {
  try {
    const propuesta = new ModeracionPage(req.body);
    await propuesta.save();
    res.status(201).json(propuesta);
  } catch (err) {
    res.status(400).json({ error: "Error al guardar propuesta", message: err.message });
  }
});

// 2. Listar propuestas por estado
router.get("/estado/:estado", async (req, res) => {
  try {
    const propuestas = await ModeracionPage.find({ estado: req.params.estado });
    res.json(propuestas);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener propuestas", message: err.message });
  }
});

// 3. Obtener una propuesta por ID
router.get("/:id", async (req, res) => {
  try {
    const propuesta = await ModeracionPage.findById(req.params.id);
    if (!propuesta) return res.status(404).json({ error: "Propuesta no encontrada" });
    res.json(propuesta);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener propuesta", message: err.message });
  }
});

// 4. Aprobar propuesta y aplicar a la página original
router.put("/aprobar/:id", async (req, res) => {
    try {
      const propuesta = await ModeracionPage.findById(req.params.id);
      if (!propuesta) return res.status(404).json({ error: "Propuesta no encontrada" });
  
      let page = await Page.findOne({ slug: propuesta.slug });
  
      if (!page) {
        // Si la página no existe, créala
        page = new Page({
          slug: propuesta.slug,
          title: propuesta.pagina || propuesta.slug,
          content: propuesta.nuevoContenido,
          enabled: true
        });
      } else {
        page.content = propuesta.nuevoContenido;
      }
  
      await page.save();
  
      propuesta.estado = "aprobado";
      await propuesta.save();
  
      res.json({ mensaje: "✅ Propuesta aprobada y aplicada" });
    } catch (err) {
      res.status(500).json({ error: "Error al aprobar propuesta", message: err.message });
    }
  });

// 5. Rechazar propuesta y enviar correo con comentario
// Rechazar propuesta
router.put("/rechazar/:id", async (req, res) => {
    try {
      const { comentarioRechazo } = req.body;
  
      const propuesta = await ModeracionPage.findByIdAndUpdate(
        req.params.id,
        {
          estado: "rechazado",
          comentarioRechazo
        },
        { new: true }
      );
  
      if (!propuesta) return res.status(404).json({ error: "Propuesta no encontrada" });
  
      // 👇 Ya no se envía el correo desde el backend
      // Ahora el frontend se encarga de hacerlo con emailjs
  
      res.json(propuesta);
    } catch (err) {
      res.status(500).json({ error: "Error al rechazar propuesta", message: err.message });
    }
  });
  

// 6. Reenviar propuesta corregida
router.put("/reenviar/:id", async (req, res) => {
  try {
    const propuesta = await ModeracionPage.findById(req.params.id);
    if (!propuesta || propuesta.estado !== "rechazado") {
      return res.status(400).json({ error: "Solo se pueden reenviar propuestas rechazadas" });
    }

    propuesta.nuevoContenido = req.body.nuevoContenido;
    propuesta.estado = "pendiente";
    propuesta.comentarioRechazo = "";
    await propuesta.save();

    res.json({ mensaje: "✅ Propuesta reenviada" });
  } catch (err) {
    res.status(500).json({ error: "Error al reenviar propuesta", message: err.message });
  }
});

module.exports = router;
