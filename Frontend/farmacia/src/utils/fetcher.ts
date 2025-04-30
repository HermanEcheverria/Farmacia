import { API_URL } from "./api";

export async function fetcher<T = any>(
  path: string,
  // <-- aquí recibes el segundo parámetro, aunque no lo uses
  _info?: { requestInit?: RequestInit; type: unknown; value?: T }
): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status} en ${path}: ${text}`);
  }
  return res.json();
}
