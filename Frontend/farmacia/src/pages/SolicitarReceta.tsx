import { createSignal } from "solid-js";
import {API_URL} from "../utils/api";

export default function SolicitarReceta() {
  const [codigoReceta, setCodigoReceta] = createSignal("");
  const [receta, setReceta] = createSignal<any>(null);
  const [error, setError] = createSignal("");

  const solicitarReceta = async (codigo) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/recetas/solicitar/${codigo}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al solicitar la receta");
  
      console.log("✅ Receta obtenida:", data);
      setReceta(data);
    } catch (error) {
      console.error("❌ Error:", error.message);
      setError(error.message);
    }
  };
  

  return (
    <div class="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 class="text-3xl font-bold mb-6 text-center">Solicitar Receta</h1>

      <div class="bg-white p-6 shadow-lg rounded-lg w-full max-w-md">
        <label class="block text-lg font-semibold mb-2">Código de Receta</label>
        <input
          type="text"
          class="border p-2 w-full mb-4"
          placeholder="Ingrese el código de la receta"
          value={codigoReceta()}
          onInput={(e) => setCodigoReceta(e.currentTarget.value)}
        />
        <button 
  class="bg-blue-500 text-white px-4 py-2 rounded w-full" 
  onClick={() => solicitarReceta(codigoReceta())} // ✅ Corrección aquí
>
  Solicitar Receta
</button>

      </div>

      {error() && <p class="text-red-600 mt-4">{error()}</p>}

      {receta() && (
        <div class="bg-white p-6 shadow-lg rounded-lg mt-6 w-full max-w-2xl">
          <h2 class="text-2xl font-semibold mb-4">Detalles de la Receta</h2>
          <p><strong>Código:</strong> {codigoReceta()}</p>
          <h3 class="text-xl font-semibold mt-4 mb-2">Medicamentos</h3>
          <ul class="list-disc pl-6">
            {receta().medicamentos.map((med) => (
              <li class={med.disponible ? "text-green-600" : "text-red-600"}>
                {med.nombre} - {med.cantidad} unidades
                {med.disponible ? " ✅ Disponible" : " ❌ No disponible"}
              </li>
            ))}
          </ul>

          {receta().medicamentos.every((m) => m.disponible) ? (
            <button class="bg-green-500 text-white px-4 py-2 rounded mt-4 w-full">
              Proceder con la Compra
            </button>
          ) : (
            <p class="text-red-600 mt-4">No se puede completar la receta por falta de medicamentos.</p>
          )}
        </div>
      )}
    </div>
  );
}
