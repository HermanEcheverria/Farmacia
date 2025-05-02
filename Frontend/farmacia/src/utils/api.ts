

// Extraemos protocolo y hostname de la URL actual
const { protocol, hostname } = window.location;

// Apunta siempre al backend de farmacia en el mismo host, puerto 5000
export const API_URL = `${protocol}//${hostname}:5000`;

// Lo mismo para el servicio de Hospital (puerto 8080)
export const HOSPITAL_API_URL = `${protocol}//${hostname}:8080/recetas`;
