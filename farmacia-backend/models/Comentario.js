const mongoose = require("mongoose");

const comentarioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medicamento: { type: mongoose.Schema.Types.ObjectId, ref: "Medicamento", required: true },
  texto: { type: String, required: true },
  respuestas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comentario" }],
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comentario", comentarioSchema);
