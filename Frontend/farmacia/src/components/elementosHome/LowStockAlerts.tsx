import { createResource, For, Show } from "solid-js";
import { fetcher } from "../../utils/fetcher";

const STOCK_THRESHOLD = 10;

export default function LowStockAlerts() {
  const [all] = createResource(() => "/medicamentos/listar", fetcher);

  return (
    <section class="container mx-auto py-16 px-4">
      <h2 class="text-3xl font-bold text-center mb-8">Alertas de Stock Bajo</h2>
      <Show when={all()} fallback={<p class="text-center">Cargando…</p>}>
        <ul class="space-y-4">
          <For each={all().filter(m=> m.stock < STOCK_THRESHOLD)}>
            {(med) => {
              const pct = ((med.stock / STOCK_THRESHOLD) * 100).toFixed(0);
              return (
                <li class="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                  <span>{med.nombre}</span>
                  <div class="w-32 bg-gray-200 h-2 rounded mr-4">
                    <div class="h-2 rounded bg-red-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span class="text-sm">{med.stock} und.</span>
                </li>
              );
            }}
          </For>
        </ul>
      </Show>
    </section>
  );
}
