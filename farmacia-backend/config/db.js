const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ Conectado a MongoDB en: ${process.env.MONGO_URI}`);
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err);
    setTimeout(connectDB, 5000); // Reintento después de 5 segundos
  }
};

module.exports = connectDB;
