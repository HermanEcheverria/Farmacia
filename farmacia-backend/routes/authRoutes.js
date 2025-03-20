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

// 🔹 Activar cuenta, cambiar rol o correo (solo admins)
router.put("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { email, role, active } = req.body;

    // Construir el objeto de actualización dinámicamente
    const updateData = {};

    if (email) {
      // Validar que el email no se repita
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({ error: "El correo ya está en uso por otro usuario." });
      }
      updateData.email = email;
    }
    
    if (role) updateData.role = role;
    if (typeof active === "boolean") updateData.active = active;

    // Verificar que al menos un campo se esté actualizando
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No se proporcionaron datos válidos para actualizar." });
    }

    // Actualizar el usuario
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedUser) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario actualizado", user: updatedUser });
  } catch (error) {
    console.error("❌ Error actualizando usuario:", error);
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
// 🔹 Ruta para registro de usuarios (signup)
router.post("/signup", async (req, res) => {
  try {
    console.log("🟢 Recibida solicitud de registro con datos:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "El correo y la contraseña son requeridos." });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya está registrado." });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario en la base de datos
    const newUser = new User({
      email,
      password: hashedPassword,
      role: "sin-registrar",  // Por defecto, se asigna el rol 'user'
      active: false  // Por defecto, el usuario está inactivo hasta que un admin lo active
    });

    await newUser.save();

    res.json({ message: "Usuario registrado correctamente. Esperando activación por un administrador." });
  } catch (error) {
    console.error("❌ Error en /signup:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});



module.exports = router;
