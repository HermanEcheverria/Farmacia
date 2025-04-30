// src/components/elementosHome/ActivePromotions.tsx
import { createResource, For, Show, type ResourceFetcher } from "solid-js";
import { fetcher } from "../../utils/fetcher";

// 1) Define el shape de tu API
type DiscountRequest = {
  _id: string;
  farmacia: string;
  porcentajeDescuento: number;
  estado: "pendiente" | "aprobado" | "rechazado";
  medicamento: { _id: string; nombre: string };
};

// 2) Envuelve tu fetcher genérico en un ResourceFetcher concreto
const fetchPromos: ResourceFetcher<string, DiscountRequest[]> = async (path) => {
  // Aquí le dices a tu fetcher que espere un DiscountRequest[]
  return fetcher<DiscountRequest[]>(path);
};

export default function ActivePromotions() {
  // 3) Ahora sí encaja perfectamente:
  //    - Source = string (la URL)
  //    - Data   = DiscountRequest[]
  const [promos] = createResource<string, DiscountRequest[]>(
    () => "/discount/listar?estado=aprobado",
    fetchPromos
  );

  return (
    <section class="container mx-auto py-16 px-4 bg-farmacia-primary-50 rounded-lg">
      <h2 class="text-3xl font-bold text-center mb-8">Promociones Activas</h2>

      <Show when={promos()} fallback={<p class="text-center">Cargando…</p>}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* promos() es un array garantizado dentro de Show */}
          <For each={promos()!}>
            {(promo) => (
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="font-semibold">{promo.medicamento.nombre}</h3>
                <p class="text-lg font-bold">
                  {promo.porcentajeDescuento}% OFF
                </p>
                <p class="text-sm text-gray-500">Estado: {promo.estado}</p>
              </div>
            )}
          </For>
        </div>
      </Show>
    </section>
  );
}
