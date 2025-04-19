const mongoose = require("mongoose");

/**
 * Esquema para la moderación de páginas.
 * 
 * @typedef {Object} ModeracionPage
 * @property {string} slug - Identificador único de la página.
 * @property {string} nuevoContenido - Nuevo contenido propuesto.
 * @property {string} estado - Estado de la moderación (pendiente, aprobado, rechazado).
 * @property {string} comentarioRechazo - Comentario en caso de rechazo.
 * @property {string} email - Correo electrónico del moderador.
 * @property {Date} createdAt - Fecha de creación.
 * @property {Date} updatedAt - Fecha de última actualización.
 */
const moderacionPageSchema = new mongoose.Schema({
  slug: { type: String, required: true },
  nuevoContenido: { type: String, required: true },
  estado: {
    type: String,
    enum: ["pendiente", "aprobado", "rechazado"],
    default: "pendiente",
  },
  comentarioRechazo: { type: String, default: "" },
  email: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("ModeracionPage", moderacionPageSchema);
