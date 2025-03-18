const allowComment = (req, res, next) => {
    if (
      req.user &&
      (req.user.role === "registrado" ||
        req.user.role === "empleado" ||
        req.user.role === "admin")
    ) {
      return next();
    }
    return res.status(401).json({
      error: "Acceso no autorizado, solo usuarios registrados, empleados o administradores pueden comentar"
    });
  };
  
  module.exports = { allowComment };