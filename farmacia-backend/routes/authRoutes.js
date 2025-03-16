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

// Middleware para verificar si el usuario es administrador
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("❌ No se recibió token en la solicitud.");
    return res.status(401).json({ error: "No hay token, acceso denegado" });
  }

  try {
    console.log("🔍 Token recibido en backend:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Token decodificado en backend:", decoded);

    if (!decoded.role || decoded.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado, no eres admin" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Error verificando token en backend:", error.message);
    return res.status(401).json({ error: "Token inválido" });
  }
};



// 🔹 Obtener todos los usuarios (solo admins)
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});

// 🔹 Activar cuenta y asignar rol (solo admins)
router.put("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { active, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active, role },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario actualizado", user });
  } catch (error) {
    res.status(500).json({ error: "Error actualizando usuario" });
  }
});

// 🔹 Ruta de inicio de sesión (login)
router.post("/login", async (req, res) => {
  try {
    console.log("🟢 Recibida solicitud de login con datos:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son obligatorios" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    if (!user.active) {
      return res.status(403).json({ error: "La cuenta no está activada. Contacta a un administrador." });
    }

    // ✅ Generar token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Inicio de sesión exitoso", token, role: user.role });
  } catch (error) {
    console.error("❌ Error en /login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


module.exports = router;
