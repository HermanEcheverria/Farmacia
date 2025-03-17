import { createSignal, createResource } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { API_URL } from "../utils/api";

const fetchMedicamentos = async (query) => {
  const params = new URLSearchParams(query);
  const response = await fetch(`${API_URL}/medicamentos/buscar?${params.toString()}`);
  return response.json();
};

export default function SearchMedicamentos() {
  const [query, setQuery] = createSignal({});
  const [medicamentos] = createResource(query, fetchMedicamentos);
  const navigate = useNavigate();

  return (
    <div class="p-4">
      <input
        type="text"
        placeholder="Buscar medicamento..."
        class="p-2 border rounded w-full"
        onInput={(e) => setQuery({ ...query(), nombre: e.target.value })}
      />
      <div class="mt-4">
        {medicamentos()?.map((med) => (
          <div 
            class="border p-4 mb-2 cursor-pointer hover:bg-gray-100"
            onClick={() => navigate(`/medicamentos/${med._id}`)}
          >
            <h2 class="text-lg font-semibold">{med.nombre}</h2>
            <p class="text-gray-600">{med.principioActivo}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
