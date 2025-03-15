require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ ERROR: `JWT_SECRET` no está definido en el .env");
  process.exit(1);
}

// 🔹 Ruta de registro (signup)
router.post("/signup", async (req, res) => {
  try {
    console.log("🟢 Recibida solicitud de registro con datos:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son obligatorios" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    console.log("🔑 Hasheando contraseña...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("📝 Guardando usuario en la base de datos...");
    const user = new User({
      email,
      password: hashedPassword,
      role: "sin-registrar",
      active: false
    });

    await user.save();
    console.log("✅ Usuario guardado en MongoDB:", user);

    // ✅ Responder al frontend para que envíe el email
    res.status(201).json({
      message: "Usuario creado exitosamente. Verifica tu correo para la activación.",
      email: user.email,
      status: "pending"
    });

  } catch (error) {
    console.error("❌ Error en /signup:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Ruta para activar la cuenta
router.post("/activate/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (user.active) {
      return res.status(400).json({ error: "La cuenta ya está activada" });
    }

    user.active = true;
    await user.save();
    console.log("✅ Cuenta activada para:", user.email);

    // ✅ Responder al frontend para que envíe el email de cuenta activada
    res.json({ message: "Cuenta activada exitosamente", status: "activated", email });

  } catch (error) {
    console.error("❌ Error en /activate:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
