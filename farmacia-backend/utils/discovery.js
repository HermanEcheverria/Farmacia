// farmacia-backend/utils/discovery.js
const Servicio = require("../models/Servicio");

// Caché interno para DNS dinámico
let cache = { hospitales: null, aseguradoras: null, ts: 0 };
const TTL = 30_000; // 30 segundos

/**
 * Lista de URLs activas por tipo, con TTL
 */
async function listServicios(tipo) {
  const now = Date.now();
  // Si la caché sigue vigente, devuelve valores almacenados
  if (cache.ts + TTL > now && cache[tipo]) {
    return cache[tipo];
  }
  // Consulta los servicios activos en MongoDB
  const docs = await Servicio.find({ tipo, activo: true });
  const urls = docs.map(s => s.baseUrl.replace(/\/+$/, ""));
  // Actualiza caché
  cache[tipo] = urls;
  cache.ts = now;
  return urls;
}

/**
 * Invalidación manual de la caché (llamar al crear/editar/eliminar)
 */
function clearDiscoveryCache() {
  cache = { hospitales: null, aseguradoras: null, ts: 0 };
}

module.exports = {
  getHospitalUrls: () => listServicios("HOSPITAL"),
  getAseguradoraUrls: () => listServicios("ASEGURADORA"),
  clearDiscoveryCache,  // ← invocar tras cambios en rutas de servicios
};
