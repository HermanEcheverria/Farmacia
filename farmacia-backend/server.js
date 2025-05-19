/**
 * @file server.js
 * @description Configuración principal del servidor para la aplicación de farmacia.
 * Incluye configuración de middleware, conexión a MongoDB y registro de rutas.
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const os       = require("os");

const authRoutes = require("./routes/authRoutes");
const medicamentoRoutes = require("./routes/medicamentoRoutes");
const recetasRoutes = require("./routes/recetasRoutes"); 
const dashboardRoutes = require("./routes/dashboardRoutes");
const pageRoutes = require("./routes/pageRoutes");
const farmaciaRoutes = require("./routes/farmaciaRoutes");
const moderacionRoutes = require("./routes/moderacionRoutes");
const discountRoutes = require("./routes/discountRoutes");
const serviciosRoutes = require("./routes/serviciosRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * CORS dinámico: acepta cualquier origen que llame al servidor
 */
app.use(cors({
  origin: true,               // refleja y permite el Origin de la petición
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true           // si quisieras usar cookies/sesiones
}));

/**
 * Middleware para habilitar CORS y parsear JSON/URL-encoded.
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Conexión a la base de datos MongoDB.
 */
mongoose.connect(process.env.MONGO_URI || "mongodb://CruzVerde:Unis@137.184.71.127:27018/farmacia?authSource=admin", {
  useNewUrlParser: true
}).then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error conectando a MongoDB:", err));

/**
 * Registro de rutas de la aplicación.
 */
app.use("/auth", authRoutes);
app.use("/medicamentos", medicamentoRoutes);
app.use("/recetas", recetasRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/pages", pageRoutes); 
app.use("/farmacia", farmaciaRoutes);
app.use("/moderacion-pages", moderacionRoutes);
app.use("/discount", discountRoutes);
app.use("/servicios", serviciosRoutes);


/**
 * Función auxiliar para obtener tu IP local
 */
function getLocalIpAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

/**
 * Inicia el servidor en el puerto especificado.
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor Farmacia corriendo en:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://${getLocalIpAddress()}:${PORT}`);

});
