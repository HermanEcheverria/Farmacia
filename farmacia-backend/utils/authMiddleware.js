const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Acceso no autorizado, token requerido" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

/**
 * Middleware que acepta uno o varios roles permitidos.
 * Ejemplo: verifyRoles("admin","interconexiones")
 */
const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    next();
  };
};

// (Opcional) Si aún quieres tener un atajo sólo para admin:
const verifyAdmin = verifyRoles("admin");

module.exports = {
  verifyToken,
  verifyRoles,
  verifyAdmin, 
};
