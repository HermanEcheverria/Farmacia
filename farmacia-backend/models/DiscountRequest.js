const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Esquema para las solicitudes de descuento.
 * 
 * @typedef {Object} DiscountRequest
 * @property {Schema.Types.ObjectId} medicamento - ID del medicamento.
 * @property {string} farmacia - Nombre de la farmacia.
 * @property {number} porcentajeDescuento - Porcentaje solicitado de descuento.
 * @property {string} estado - Estado de la solicitud (pendiente, aprobado, rechazado).
 * @property {Date} createdAt - Fecha de creación de la solicitud.
 */
const DiscountRequestSchema = new Schema({
  medicamento: { type: Schema.Types.ObjectId, ref: "Medicamento", required: true },
  farmacia: { type: String, required: true },
  porcentajeDescuento: { type: Number, required: true },
  estado: { type: String, enum: ["pendiente", "aprobado", "rechazado"], default: "pendiente" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DiscountRequest", DiscountRequestSchema);