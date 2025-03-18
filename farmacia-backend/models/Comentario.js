const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ComentarioSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  medicamento: { type: Schema.Types.ObjectId, ref: "Medicamento", required: true },
  texto: { type: String, required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Comentario", default: null },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comentario", ComentarioSchema);