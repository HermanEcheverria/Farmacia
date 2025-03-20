import { createSignal, onMount } from "solid-js";
import { A } from "@solidjs/router";
import { API_URL } from "../utils/api";

export default function FeaturedMedications() {
  const [medicamentos, setMedicamentos] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal("");

  onMount(async () => {
    try {
      const response = await fetch(`${API_URL}/medicamentos/listar`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Error al cargar medicamentos");
      }
      const data = await response.json();
      // Por ejemplo, tomar los primeros 6:
      setMedicamentos(data.slice(0, 6));
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  });
  

  return (
    <section class="container mx-auto py-12 px-4">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">
        Medicamentos Destacados
      </h2>
      {loading() ? (
        <p class="text-center">Cargando medicamentos...</p>
      ) : error() ? (
        <p class="text-center text-red-600">{error()}</p>
      ) : (
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicamentos().map((med) => (
            <div class="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
              {med.fotos && med.fotos.length > 0 ? (
                <img
                  src={med.fotos[0]}
                  alt={med.nombre}
                  class="w-full h-48 object-cover"
                />
              ) : (
                <div class="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span class="text-gray-500">Sin imagen</span>
                </div>
              )}
              <div class="p-4">
                <h3 class="text-xl font-semibold text-farmacia-primary-1">{med.nombre}</h3>
                <p class="mt-2 text-gray-600 line-clamp-3">{med.descripcion}</p>
                <p class="mt-2 font-bold text-farmacia-secondary-1">${med.precio}</p>
                <A
                  href={`/medicamentos/${med._id}`}
                  class="mt-4 inline-block text-sm text-farmacia-primary-1 font-semibold hover:underline"
                >
                  Ver más
                </A>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
