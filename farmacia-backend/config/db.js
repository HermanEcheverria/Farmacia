const mongoose = require("mongoose");

/**
 * Conecta la aplicación a la base de datos MongoDB.
 * Reintenta la conexión automáticamente en caso de error.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>} Promesa que se resuelve cuando la conexión es exitosa.
 */
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
