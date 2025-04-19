const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Esquema para los comentarios.
 * 
 * @typedef {Object} Comentario
 * @property {Schema.Types.ObjectId} user - ID del usuario que realizó el comentario.
 * @property {Schema.Types.ObjectId} medicamento - ID del medicamento comentado.
 * @property {string} texto - Texto del comentario.
 * @property {Schema.Types.ObjectId} parentId - ID del comentario padre (si es una respuesta).
 * @property {Date} fecha - Fecha del comentario.
 */
const ComentarioSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  medicamento: { type: Schema.Types.ObjectId, ref: "Medicamento", required: true },
  texto: { type: String, required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Comentario", default: null },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comentario", ComentarioSchema);