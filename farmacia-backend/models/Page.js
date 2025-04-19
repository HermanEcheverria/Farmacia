const mongoose = require("mongoose");

/**
 * Esquema para las páginas del sistema.
 * 
 * @typedef {Object} Page
 * @property {string} title - Título de la página.
 * @property {string} slug - Identificador único de la página.
 * @property {string} content - Contenido de la página.
 * @property {boolean} enabled - Indica si la página está habilitada.
 * @property {Date} createdAt - Fecha de creación de la página.
 */
const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // "faq", "contacto", etc.
  content: { type: String, required: true },            
  enabled: { type: Boolean, default: true },            // Para habilitar/deshabilitar la página
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Page", pageSchema);
