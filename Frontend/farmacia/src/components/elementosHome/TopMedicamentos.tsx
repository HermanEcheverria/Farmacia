import { createResource, For, Show } from "solid-js";
import { fetcher } from "../../utils/fetcher";

export default function TopMedicamentos() {
  const [data] = createResource(() => "/dashboard/top-medicamentos", fetcher);

  return (
    <section class="container mx-auto py-16 px-4">
      <h2 class="text-3xl font-bold text-center mb-8">Top 5 Medicamentos más vendidos</h2>
      <Show when={data()} fallback={<p class="text-center">Cargando…</p>}>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <For each={data().medicamentos}>
            {(med) => (
              <div class="bg-white p-6 rounded-lg shadow text-center">
                {/* Asumo que tu API no devuelve imagen; podrías mapear un default o ruta real */}
                <div class="h-16 w-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span class="text-2xl font-bold">{med.medicamento[0]}</span>
                </div>
                <h3 class="font-semibold">{med.medicamento}</h3>
                <p class="text-sm text-gray-500">{med.totalVentas} unidades</p>
                <div class="w-full bg-gray-200 h-2 rounded mt-2">
                  <div
                    class="bg-farmacia-primary-1 h-2 rounded"
                    style={{ width: `${med.porcentaje}%` }}
                  />
                </div>
                <span class="text-xs">{med.porcentaje}% del total</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </section>
  );
}
