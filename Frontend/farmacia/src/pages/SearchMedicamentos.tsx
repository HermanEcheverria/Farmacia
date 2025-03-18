import { createSignal, createResource } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { API_URL } from "../utils/api";

const fetchMedicamentos = async (query) => {
  const params = new URLSearchParams(query);
  const response = await fetch(`${API_URL}/medicamentos/buscar?${params.toString()}`);
  return response.json();
};

export default function SearchMedicamentos() {
  const navigate = useNavigate();

  // Estados para los filtros de búsqueda
  const [nombre, setNombre] = createSignal("");
  const [principioActivo, setPrincipioActivo] = createSignal("");
  const [descripcion, setDescripcion] = createSignal("");
  const [marca, setMarca] = createSignal("");

  // Estado para la consulta de medicamentos
  const [query, setQuery] = createSignal({});
  const [medicamentos] = createResource(query, fetchMedicamentos);

  // 🔍 Función para ejecutar la búsqueda al presionar el botón
  const buscarMedicamentos = () => {
    setQuery({
      ...(nombre() && { nombre: nombre() }),
      ...(principioActivo() && { principioActivo: principioActivo() }),
      ...(descripcion() && { descripcion: descripcion() }),
      ...(marca() && { marca: marca() }),
    });
  };

  return (
    <div class="p-4 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4 text-center">Buscar Medicamentos</h1>

      {/* 🔎 Filtros de búsqueda */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Nombre del medicamento"
          class="p-2 border rounded w-full"
          value={nombre()}
          onInput={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Principio Activo"
          class="p-2 border rounded w-full"
          value={principioActivo()}
          onInput={(e) => setPrincipioActivo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción"
          class="p-2 border rounded w-full"
          value={descripcion()}
          onInput={(e) => setDescripcion(e.target.value)}
        />
        <input
          type="text"
          placeholder="Marca (Farmacéutica)"
          class="p-2 border rounded w-full"
          value={marca()}
          onInput={(e) => setMarca(e.target.value)}
        />
      </div>

      {/* 🔘 Botón de búsqueda */}
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2 hover:bg-blue-600 transition"
        onClick={buscarMedicamentos}
      >
        Buscar Medicamentos
      </button>

      {/* 📦 Resultados de la búsqueda */}
      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Show when={medicamentos()?.length === 0 && Object.keys(query()).length > 0}>
          <p class="text-gray-500 text-center">No se encontraron medicamentos.</p>
        </Show>

        <For each={medicamentos()}>
          {(med) => (
            <div
              class="border p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition"
              onClick={() => navigate(`/medicamentos/${med._id}`)}
            >
              {/* 🔹 Imagen del medicamento */}
              <div class="w-full h-40 flex justify-center items-center bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={med.fotos?.length > 0 ? med.fotos[0] : "/placeholder.png"}
                  alt={med.nombre}
                  class="object-cover h-full w-full"
                />
              </div>

              {/* 🔹 Información del medicamento */}
              <h2 class="text-lg font-semibold mt-2">{med.nombre}</h2>
              <p class="text-gray-600">{med.principioActivo}</p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
