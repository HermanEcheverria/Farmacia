export function getUser() {
    const token = localStorage.getItem("token");
    if (!token) return null;
  
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decodifica el token JWT
      return { email: payload.email, role: payload.role };
    } catch (error) {
      console.error("❌ Error al decodificar el token:", error);
      return null;
    }
  }
  
  export function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  