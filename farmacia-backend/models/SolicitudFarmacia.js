// models/SolicitudFarmacia.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Esquema para las solicitudes de farmacia.
 * 
 * @typedef {Object} SolicitudFarmacia
 * @property {string} nombre - Nombre de la farmacia.
 * @property {string} direccion - Dirección de la farmacia.
 * @property {string} telefono - Teléfono de contacto.
 * @property {string} aseguradora - Aseguradora asociada.
 * @property {string} origen - Origen de la solicitud.
 * @property {string} codigoSolicitud - Código único de la solicitud.
 * @property {string} estado - Estado de la solicitud (pendiente, etc.).
 * @property {Date} createdAt - Fecha de creación de la solicitud.
 */
const SolicitudFarmaciaSchema = new Schema({
  nombre: { type: String, required: true },
  direccion: { type: String, required: true },
  telefono: { type: String, required: true },
  aseguradora: { type: String, required: true },
  origen: { type: String, required: true },
  codigoSolicitud: { type: String, required: true },
  estado: { type: String, default: "pendiente" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SolicitudFarmacia", SolicitudFarmaciaSchema);
