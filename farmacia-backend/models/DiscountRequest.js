const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DiscountRequestSchema = new Schema({
  medicamento: { type: Schema.Types.ObjectId, ref: "Medicamento", required: true },
  farmacia: { type: String, required: true },
  porcentajeDescuento: { type: Number, required: true },
  estado: { type: String, enum: ["pendiente", "aprobado", "rechazado"], default: "pendiente" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DiscountRequest", DiscountRequestSchema);