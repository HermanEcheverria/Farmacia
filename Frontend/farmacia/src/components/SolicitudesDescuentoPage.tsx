import { createSignal, createResource, Component, For, Show } from "solid-js";
import { API_URL } from "../utils/api";

const fetchSolicitudes = async (estado: string) => {
  const res = await fetch(`${API_URL}/discount/listar?estado=${estado}`);
  return res.json();
};

const SolicitudesDescuentoPage: Component = () => {
  const [estado, setEstado] = createSignal("pendiente");
  const [solicitudes] = createResource(estado, fetchSolicitudes);

  return (
    <div class="p-8 bg-[#E9F8FB] min-h-screen">
      <h1 class="text-3xl font-bold text-[#024059] mb-6 text-center">
        Solicitudes de Descuento
      </h1>

      <div class="mb-6 flex justify-center items-center gap-2">
        <label class="font-semibold text-[#026E81]">Estado:</label>
        <select
          class="border border-[#00ABBD] p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00ABBD]"
          value={estado()}
          onInput={(e) => setEstado(e.currentTarget.value)}
        >
          <option value="pendiente">Pendientes</option>
          <option value="aprobado">Aprobadas</option>
          <option value="rechazado">Rechazadas</option>
        </select>
      </div>

      <Show when={!solicitudes.loading} fallback={<p class="text-center text-[#026E81]">Cargando...</p>}>
        <table class="w-full border border-[#A1C7E0] rounded-xl overflow-hidden shadow-md bg-white">
          <thead class="bg-[#A1C7E0] text-[#024059]">
            <tr>
              <th class="border border-[#A1C7E0] p-3">Medicamento</th>
              <th class="border border-[#A1C7E0] p-3">Farmacia</th>
              <th class="border border-[#A1C7E0] p-3">% Descuento</th>
              <th class="border border-[#A1C7E0] p-3">Estado</th>
              <Show when={estado() === "pendiente"}>
                <th class="border border-[#A1C7E0] p-3">Acciones</th>
              </Show>
            </tr>
          </thead>
          <tbody>
            <For each={solicitudes()}>
              {(s) => (
                <tr class="hover:bg-[#F0FAFC]">
                  <td class="border border-[#A1C7E0] p-3">{s.medicamento?.nombre || "-"}</td>
                  <td class="border border-[#A1C7E0] p-3">{s.farmacia}</td>
                  <td class="border border-[#A1C7E0] p-3">{s.porcentajeDescuento}%</td>
                  <td
                    class={`border border-[#A1C7E0] p-3 font-bold text-center ${
                      s.estado === "aprobado"
                        ? "text-green-600"
                        : s.estado === "rechazado"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {s.estado.toUpperCase()}
                  </td>
                  <Show when={estado() === "pendiente"}>
                    <td class="border border-[#A1C7E0] p-3 flex gap-2 justify-center">
                      <button
                        class="bg-[#0099DD] hover:bg-[#007cb2] text-white px-4 py-1 rounded font-medium transition"
                        onClick={async () => {
                          const res = await fetch(`${API_URL}/discount/procesar/${s._id}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              aprobar: true,
                              nuevoDescuento: s.porcentajeDescuento,
                            }),
                          });
                          if (res.ok) solicitudes.refetch();
                        }}
                      >
                        Aprobar
                      </button>
                      <button
                        class="bg-[#FF9933] hover:bg-[#e68500] text-white px-4 py-1 rounded font-medium transition"
                        onClick={async () => {
                          const res = await fetch(`${API_URL}/discount/procesar/${s._id}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ aprobar: false }),
                          });
                          if (res.ok) solicitudes.refetch();
                        }}
                      >
                        Rechazar
                      </button>
                    </td>
                  </Show>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <Show when={solicitudes()?.length === 0}>
          <p class="mt-4 text-center text-[#026E81]">No hay solicitudes en este estado.</p>
        </Show>
      </Show>
    </div>
  );
};

export default SolicitudesDescuentoPage;
