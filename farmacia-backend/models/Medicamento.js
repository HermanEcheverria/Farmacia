const mongoose = require("mongoose");

/**
 * Esquema para los medicamentos.
 * 
 * @typedef {Object} Medicamento
 * @property {string} codigo - Código único del medicamento.
 * @property {string} nombre - Nombre del medicamento.
 * @property {string} principioActivo - Principio activo del medicamento.
 * @property {string} descripcion - Descripción del medicamento.
 * @property {string} categoria - Categoría del medicamento.
 * @property {Array<string>} fotos - URLs de las fotos del medicamento.
 * @property {string} concentracion - Concentración del medicamento.
 * @property {string} presentacion - Presentación del medicamento.
 * @property {number} unidadesPorPresentacion - Unidades por presentación.
 * @property {string} farmaceutica - Farmacéutica que produce el medicamento.
 * @property {boolean} requiereReceta - Indica si requiere receta médica.
 * @property {number} stock - Cantidad en inventario.
 * @property {number} precio - Precio del medicamento.
 * @property {number} descuento - Porcentaje de descuento.
 * @property {Date} createdAt - Fecha de creación.
 * @property {Array<Schema.Types.ObjectId>} comentarios - IDs de los comentarios asociados.
 */
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
  descuento: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  comentarios: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comentario" }]
});

module.exports = mongoose.model("Medicamento", medicamentoSchema);
