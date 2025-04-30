// src/components/elementosHome/PharmacyRequests.tsx
import { createResource, For, Show } from "solid-js";
import { fetcher } from "../../utils/fetcher";

// 1) Define el tipo que va a devolver tu endpoint
type DiscountRequest = {
  _id: string;
  farmacia: string;
  porcentajeDescuento: number;
  estado: "pendiente" | "aprobado" | "rechazado";
  medicamento: { _id: string; nombre: string };
};

export default function PharmacyRequests() {
  // 2) Aquí indicamos <string, DiscountRequest[]> 
  //    → el source es string (la URL) y el data es DiscountRequest[]
  const [allReqs] = createResource<string, DiscountRequest[]>(
    () => "/discount/listar",
    path => fetcher<DiscountRequest[]>(path)
  );

  return (
    <section class="container mx-auto py-16 px-4 bg-farmacia-primary-50 rounded-lg">
      <h2 class="text-3xl font-bold text-center mb-8">Mis Solicitudes</h2>

      {/* 3) Mientras carga */}
      <Show when={allReqs()} fallback={<p class="text-center">Cargando…</p>}>
        {/* 4) DEBUG: mira qué trae tu endpoint */}
        {/* <pre class="bg-gray-100 p-4">{JSON.stringify(allReqs(), null, 2)}</pre> */}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <For each={allReqs()!}>
            {(req) => (
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="font-semibold">{req.medicamento.nombre}</h3>
                <p class="text-sm">Estado: {req.estado}</p>
                <p class="text-sm">
                  Descuento pedido: {req.porcentajeDescuento}%
                </p>
                <p class="text-xs text-gray-500">
                  Farmacia: {req.farmacia}
                </p>
              </div>
            )}
          </For>
        </div>
      </Show>
    </section>
  );
}
