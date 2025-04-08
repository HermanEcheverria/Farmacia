import { createSignal, createResource, Show, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { API_URL } from "../utils/api";

const fetchMedicamentos = async (query) => {
  const params = new URLSearchParams(query);
  const response = await fetch(`${API_URL}/medicamentos/buscar?${params.toString()}`);
  return response.json();
};

export default function SearchMedicamentos() {
  const navigate = useNavigate();
  const [nombre, setNombre] = createSignal("");
  const [principioActivo, setPrincipioActivo] = createSignal("");
  const [descripcion, setDescripcion] = createSignal("");
  const [marca, setMarca] = createSignal("");
  const [query, setQuery] = createSignal({});
  const [medicamentos] = createResource(query, fetchMedicamentos);

  const buscarMedicamentos = () => {
    setQuery({
      ...(nombre() && { nombre: nombre() }),
      ...(principioActivo() && { principioActivo: principioActivo() }),
      ...(descripcion() && { descripcion: descripcion() }),
      ...(marca() && { marca: marca() }),
    });
  };

  return (
<div class="p-4 max-w-5xl mx-auto">
  <div class="bg-[rgba(4,191,138,0.05)] border border-[#04BF8A] rounded-2xl shadow-md p-6">
    <h1 class="text-2xl font-bold mb-6 text-center text-[#024059]">Buscar Medicamentos</h1>

    {/* 🔎 Filtros de búsqueda */}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <input
        type="text"
        placeholder="Nombre del medicamento"
        class="p-3 border border-[#026873] rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
        value={nombre()}
        onInput={(e) => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Principio Activo"
        class="p-3 border border-[#026873] rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
        value={principioActivo()}
        onInput={(e) => setPrincipioActivo(e.target.value)}
      />
      <input
        type="text"
        placeholder="Descripción"
        class="p-3 border border-[#026873] rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
        value={descripcion()}
        onInput={(e) => setDescripcion(e.target.value)}
      />
      <input
        type="text"
        placeholder="Marca (Farmacéutica)"
        class="p-3 border border-[#026873] rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
        value={marca()}
        onInput={(e) => setMarca(e.target.value)}
      />
    </div>

    <button
      class="bg-[#04BF8A] text-white px-6 py-3 rounded-md w-full hover:bg-[#03A66A] transition font-semibold"
      onClick={buscarMedicamentos}
    >
      Buscar Medicamentos
    </button>

    {/* 📦 Resultados de la búsqueda */}
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Show when={medicamentos()?.length === 0 && Object.keys(query()).length > 0}>
        <p class="text-[#026873] text-center col-span-full">No se encontraron medicamentos.</p>
      </Show>

      <For each={medicamentos()}>
        {(med) => (
          <div
            class="border border-[#A1C7E0] bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition"
            onClick={() => navigate(`/medicamentos/${med._id}`)}
          >
            <div class="w-full h-40 flex justify-center items-center bg-[#E6F9F5] rounded-lg overflow-hidden">
              <img
                src={med.fotos?.length > 0 ? med.fotos[0] : "/placeholder.png"}
                alt={med.nombre}
                class="object-cover h-full w-full"
              />
            </div>
            <h2 class="text-lg font-semibold mt-2 text-[#024059]">{med.nombre}</h2>
            <p class="text-[#026873]">{med.principioActivo}</p>
          </div>
        )}
      </For>
    </div>
  </div>
</div>

  );
}
