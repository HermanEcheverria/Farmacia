const mongoose = require("mongoose");

const medicamentoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  principioActivo: { type: String, required: true },
  descripcion: { type: String },
  categoria: { type: String, required: true },
  fotos: [{ type: String }],
  concentracion: { type: String, required: true },
  presentacion: { type: String, required: true },
  unidadesPorPresentacion: { type: Number, required: true },
  farmaceutica: { type: String, required: true },
  requiereReceta: { type: Boolean, default: false },
  stock: { type: Number, required: true },
  precio: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  comentarios: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comentario" }]
});

module.exports = mongoose.model("Medicamento", medicamentoSchema);
