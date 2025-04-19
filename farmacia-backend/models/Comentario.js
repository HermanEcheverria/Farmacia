const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @typedef {Object} Comentario
 * @property {string} user - ID del usuario que realizó el comentario.
 * @property {string} medicamento - ID del medicamento comentado.
 * @property {string} texto - Texto del comentario.
 * @property {string|null} parentId - ID del comentario padre (si es una respuesta).
 * @property {Date} fecha - Fecha del comentario.
 */

/**
 * Modelo de comentario para MongoDB usando Mongoose.
 * @type {mongoose.Model<Comentario>}
 */
const Comentario = mongoose.model("Comentario", new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  medicamento: { type: Schema.Types.ObjectId, ref: "Medicamento", required: true },
  texto: { type: String, required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Comentario", default: null },
  fecha: { type: Date, default: Date.now }
}));

module.exports = Comentario;
