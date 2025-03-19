
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ventaSchema = new Schema({
  medicamentos: [
    {
      medicamentoId: { type: Schema.Types.ObjectId, ref: 'Medicamento', required: true },
      cantidad: { type: Number, required: true },
      precioUnitario: { type: Number, required: true }
    }
  ],
  montoTotal: { type: Number, required: true },
  sucursal: { type: String },
  fechaVenta: { type: Date, default: Date.now },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});

module.exports = mongoose.model('Venta', ventaSchema);
