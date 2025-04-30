const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Acceso no autorizado, token requerido" });
  }

  console.log("Token recibido:", token); // Log para depuración

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decodificado:", decoded); // Log para depuración
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("Error al verificar el token:", error.message); // Log detallado del error
    return res.status(401).json({ error: "Token inválido" });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado, solo administradores pueden acceder" });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
