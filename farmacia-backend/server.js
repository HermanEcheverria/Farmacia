const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const medicamentoRoutes = require("./routes/medicamentoRoutes");
const recetasRoutes = require("./routes/recetasRoutes"); 
const dashboardRoutes = require("./routes/dashboardRoutes");
const pageRoutes = require("./routes/pageRoutes");
const farmaciaRoutes = require("./routes/farmaciaRoutes");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI || "mongodb://CruzVerde:Unis@137.184.71.127:27018/farmacia?authSource=admin", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error conectando a MongoDB:", err));

app.use("/auth", authRoutes);
app.use("/medicamentos", medicamentoRoutes);
app.use("/recetas", recetasRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/pages", pageRoutes); 
app.use("/farmacia", farmaciaRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  
  // Mostrar rutas registradas
  console.log("🔍 Rutas registradas en Express:");
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`✅ ${r.route.stack[0].method.toUpperCase()} ${r.route.path}`);
    }
  });
});
