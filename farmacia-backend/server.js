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

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/medicamentos", medicamentoRoutes);
app.use("/api/layout", layoutRoutes);
app.use("/auth", authRoutes);  

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://CruzVerde:Unis@137.184.71.127:27018/farmacia?authSource=admin")
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
