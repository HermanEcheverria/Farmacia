const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // "faq", "contacto", etc.
  content: { type: String, required: true },            
  enabled: { type: Boolean, default: true },            // Para habilitar/deshabilitar la página
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Page", pageSchema);
