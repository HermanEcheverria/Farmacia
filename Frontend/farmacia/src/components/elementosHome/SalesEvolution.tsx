// src/components/elementosHome/SalesEvolution.tsx
import { createResource, Show } from "solid-js";
import "chart.js/auto";
import * as SolidChart from "solid-chartjs";
import type { ChartData, ChartOptions } from "chart.js";
import { fetcher } from "../../utils/fetcher";

// === Tipado de la respuesta ===
interface MonthlySale {
  _id: string;         // e.g. "2025-04"
  totalVentas: number; // e.g. 52000
}
interface EvolResponse {
  ventasMensuales: MonthlySale[];
}

export default function SalesEvolution() {
  // Aquí sólo un createResource y con nombre descriptivo:
  const [evolucion] = createResource<string, EvolResponse>(
    () => "/dashboard/evolucion-ventas",
    // fetchPromos sería un wrapper, pero puedes usar directamente fetcher<T>
    // porque ya le pasamos el genérico en la llamada:
    (path) => fetcher<EvolResponse>(path)
  );

  // Construye la data de Chart.js
  const data: ChartData<"line"> = {
    labels: evolucion()?.ventasMensuales.map((v) => v._id) ?? [],
    datasets: [
      {
        label: "Ventas Mensuales",
        data: evolucion()?.ventasMensuales.map((v) => v.totalVentas) ?? [],
        fill: false,
        tension: 0.3,
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: "Mes" } },
      y: { title: { display: true, text: "Monto vendido" } },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <section class="container mx-auto py-16 px-4">
      <h2 class="text-3xl font-bold text-center mb-8">
        Evolución de Ventas Mensuales
      </h2>

      <Show when={evolucion()} fallback={<p class="text-center">Cargando…</p>}>
        <div class="w-full h-64">
          <SolidChart.Line
            data={data}
            options={options}
            width={400}
            height={300}
          />
        </div>
      </Show>
    </section>
  );
}
