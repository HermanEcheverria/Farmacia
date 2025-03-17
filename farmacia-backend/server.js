const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const medicamentoRoutes = require("./routes/medicamentoRoutes");
const layoutRoutes = require("./routes/layoutRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Configuración de CORS
app.use(cors({
  origin: "*",  // Permitir acceso desde cualquier origen
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

// ✅ Middleware para JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Permitir el envío de formularios

// ✅ Conexión a MongoDB (Eliminamos GridFS)
mongoose.connect(process.env.MONGO_URI || "mongodb://CruzVerde:Unis@137.184.71.127:27018/farmacia?authSource=admin")
  .then(() => {
    console.log("✅ Conectado a MongoDB");
  })
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));

// ✅ Rutas del backend
app.use("/medicamentos", medicamentoRoutes);
app.use("/api/layout", layoutRoutes);
app.use("/auth", authRoutes);

// ✅ Iniciar servidor
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`));
