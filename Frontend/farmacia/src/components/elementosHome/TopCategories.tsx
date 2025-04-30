import { createResource, For, Show } from "solid-js";
import { fetcher } from "../../utils/fetcher";

export default function TopCategories() {
  const [data] = createResource(() => "/dashboard/top-categories", fetcher);

  return (
    <section class="container mx-auto py-16 px-4 bg-farmacia-primary-50 rounded-lg">
      <h2 class="text-3xl font-bold text-center mb-8">Categorías Populares</h2>
      <Show when={data()} fallback={<p class="text-center">Cargando…</p>}>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <For each={data().categories}>
            {(cat) => (
              <div class="bg-white p-6 rounded-lg shadow flex flex-col items-center">
                <i class="bi bi-tags text-4xl mb-2 text-farmacia-secondary-2" />
                <h3 class="font-semibold">{cat.categoria}</h3>
                <span class="text-sm text-gray-500">{cat.porcentaje}%</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </section>
  );
}
