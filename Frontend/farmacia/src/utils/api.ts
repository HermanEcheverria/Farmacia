
// Extraemos protocolo y hostname de la URL actual
const { protocol, hostname } = window.location;

// Base de la API de farmacia
export const API_URL = `${protocol}//${hostname}:5000`;

// ENDPOINTS DE SERVICIOS
const SERVICIOS_BASE = `${API_URL}/servicios`;

/**
 * Obtiene todos los servicios activos, opcionalmente filtrados por tipo.
 * @param token JWT Bearer
 * @param tipo "HOSPITAL" | "ASEGURADORA" | undefined
 */
export async function fetchServicios(token: string, tipo?: string) {
  const url = tipo
    ? `${SERVICIOS_BASE}?tipo=${encodeURIComponent(tipo)}`
    : SERVICIOS_BASE;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Crea un nuevo servicio (Hospital o Aseguradora).
 */
export async function crearServicio(
  data: { nombre: string; baseUrl: string; tipo: string },
  token: string
) {
  const res = await fetch(SERVICIOS_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Actualiza un servicio existente por su ID.
 */
export async function actualizarServicio(
  id: string,
  data: { nombre?: string; baseUrl?: string; activo?: boolean },
  token: string
) {
  const res = await fetch(`${SERVICIOS_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Desactiva (soft-delete) un servicio por su ID.
 */
export async function eliminarServicio(id: string, token: string) {
  const res = await fetch(`${SERVICIOS_BASE}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}
