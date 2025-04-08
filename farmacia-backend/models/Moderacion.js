const mongoose = require("mongoose");

const moderacionPageSchema = new mongoose.Schema({
  slug: { type: String, required: true },
  nuevoContenido: { type: String, required: true },
  estado: {
    type: String,
    enum: ["pendiente", "aprobado", "rechazado"],
    default: "pendiente",
  },
  comentarioRechazo: { type: String, default: "" },
  email: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("ModeracionPage", moderacionPageSchema);
