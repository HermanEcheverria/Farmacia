const mongoose = require("mongoose");

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
