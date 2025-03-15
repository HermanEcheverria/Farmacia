const express = require("express");
const router = express.Router();

// Ruta de prueba
router.get("/", (req, res) => {
  res.json({ mensaje: "Ruta de medicamentos funcionando!" });
});

module.exports = router;
