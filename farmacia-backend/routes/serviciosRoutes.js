// farmacia-backend/routes/serviciosRoutes.js
const express = require("express");
const Servicio = require("../models/Servicio");
const { verifyToken, verifyRoles } = require("../utils/authMiddleware");
const { clearDiscoveryCache } = require("../utils/discovery"); // invalidar caché al cambiar servicios

const router = express.Router();

// GET /servicios?tipo=HOSPITAL|ASEGURADORA
router.get(
  "/",
  verifyToken,
  verifyRoles("admin", "interconexiones"),
  async (req, res) => {
    try {
      const { tipo } = req.query;
      // si filtran por tipo, devolvemos sólo activos de ese tipo;
      // si no, devolvemos todo (activos e inactivos) para administración.
      const filter = tipo
        ? { tipo, activo: true }
        : {};
      const servicios = await Servicio.find(filter).sort("nombre");
      res.json(servicios);
    } catch (err) {
      res.status(500).json({ error: "Error al listar servicios" });
    }
  }
);

// POST /servicios
router.post(
  "/",
  verifyToken,
  verifyRoles("admin", "interconexiones"),
  async (req, res) => {
    try {
      const { nombre, baseUrl, tipo } = req.body;
      const nuevo = await Servicio.create({ nombre, baseUrl, tipo });
      clearDiscoveryCache(); // ← invalidar caché tras creación
      res.status(201).json(nuevo);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// PUT /servicios/:id
router.put(
  "/:id",
  verifyToken,
  verifyRoles("admin", "interconexiones"),
  async (req, res) => {
    try {
      const { nombre, baseUrl, tipo, activo } = req.body;
      const updates = { nombre, baseUrl, tipo, activo };
      const servicio = await Servicio.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );
      if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });
      clearDiscoveryCache(); // ← invalidar caché tras edición
      res.json(servicio);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// DELETE /servicios/:id  (hard delete)
router.delete(
  "/:id",
  verifyToken,
  verifyRoles("admin", "interconexiones"),
  async (req, res) => {
    try {
      const eliminado = await Servicio.findByIdAndDelete(req.params.id);
      if (!eliminado) return res.status(404).json({ error: "Servicio no encontrado" });
      clearDiscoveryCache(); // ← invalidar caché tras eliminación
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: "Error al eliminar servicio" });
    }
  }
);

module.exports = router;
