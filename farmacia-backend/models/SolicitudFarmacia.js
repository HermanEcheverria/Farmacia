// models/SolicitudFarmacia.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SolicitudFarmaciaSchema = new Schema({
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  telefono: { type: String, required: true },
  aseguradora: { type: String, required: true },
  estado: { type: String, default: "pendiente" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SolicitudFarmacia", SolicitudFarmaciaSchema);
