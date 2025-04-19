const mongoose = require("mongoose");

/**
 * Esquema para las recetas médicas.
 * 
 * @typedef {Object} Receta
 * @property {string} codigo - Código único de la receta.
 * @property {string} paciente - Nombre del paciente.
 * @property {Array<Object>} medicamentos - Lista de medicamentos prescritos.
 * @property {string} medicamentos.codigo - Código del medicamento.
 * @property {string} medicamentos.nombre - Nombre del medicamento.
 * @property {string} medicamentos.principioActivo - Principio activo del medicamento.
 * @property {number} medicamentos.cantidad - Cantidad prescrita.
 * @property {string} medicamentos.dosis - Dosis del medicamento.
 * @property {string} medicamentos.frecuencia - Frecuencia de administración.
 * @property {number} medicamentos.duracionDias - Duración del tratamiento en días.
 * @property {Date} fechaEmision - Fecha de emisión de la receta.
 */
const recetaSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  paciente: { type: String, required: true },
  medicamentos: [
    {
      codigo: { type: String, required: true },
      nombre: { type: String, required: true },
      principioActivo: { type: String, required: true },
      cantidad: { type: Number, required: true },
      dosis: { type: String, required: true },
      frecuencia: { type: String, required: true },
      duracionDias: { type: Number, required: true },
    }
  ],
  fechaEmision: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Receta", recetaSchema);
