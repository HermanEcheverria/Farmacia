const mongoose = require("mongoose");

const servicioSchema = new mongoose.Schema({
  nombre:    { type: String, required: true, unique: true },
  baseUrl:   { type: String, required: true },
  tipo:      { type: String, enum: ["HOSPITAL", "ASEGURADORA"], required: true },
  activo:    { type: Boolean, default: true },
  creado:    { type: Date, default: () => new Date() },
});

module.exports = mongoose.model("Servicio", servicioSchema);
