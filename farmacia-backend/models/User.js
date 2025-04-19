const mongoose = require("mongoose");

/**
 * Esquema para los usuarios del sistema.
 * 
 * @typedef {Object} User
 * @property {string} email - Correo electrónico del usuario.
 * @property {string} password - Contraseña del usuario.
 * @property {string} role - Rol del usuario (admin, empleado, etc.).
 * @property {boolean} active - Indica si el usuario está activo.
 * @property {Date} createdAt - Fecha de creación del usuario.
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "empleado", "paciente", "interconexiones", "sin-registrar"],
    default: "sin-registrar"
  },
  active: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
