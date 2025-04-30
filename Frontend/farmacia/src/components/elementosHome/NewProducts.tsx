import { createResource, For, Show } from "solid-js";
import { fetcher } from "../../utils/fetcher";

export default function NewProducts() {
  const [all] = createResource(() => "/medicamentos/listar", fetcher);
  

  return (
    <section class="container mx-auto py-16 px-4 bg-farmacia-primary-50 rounded-lg">
      <h2 class="text-3xl font-bold text-center mb-8">Nuevos en Inventario</h2>
      <Show when={all()} fallback={<p class="text-center">Cargando…</p>}>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <For each={all().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5)}>
            {(med) => (
              <div class="bg-white p-4 rounded-lg shadow">
                <div class="h-32 bg-gray-100 mb-4 rounded-lg" />
                <h3 class="font-semibold">{med.nombre}</h3>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mt-2 inline-block">Nuevo</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </section>
  );
}
