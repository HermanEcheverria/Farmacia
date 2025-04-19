const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Esquema para las ventas realizadas en la farmacia.
 * 
 * @typedef {Object} Venta
 * @property {Array<Object>} medicamentos - Lista de medicamentos vendidos.
 * @property {Schema.Types.ObjectId} medicamentos.medicamentoId - ID del medicamento.
 * @property {number} medicamentos.cantidad - Cantidad vendida.
 * @property {number} medicamentos.precioUnitario - Precio unitario del medicamento.
 * @property {number} montoTotal - Monto total de la venta.
 * @property {string} sucursal - Sucursal donde se realizó la venta.
 * @property {Date} fechaVenta - Fecha de la venta.
 * @property {Schema.Types.ObjectId} usuario - ID del usuario que realizó la venta.
 */
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
