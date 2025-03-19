import { createSignal, onMount } from "solid-js";
import Chart from "chart.js/auto";
import { API_URL } from "../utils/api";

const EvolucionVentasChart = () => {
  let canvasRef: HTMLCanvasElement | undefined;
  const [ventasMensuales, setVentasMensuales] = createSignal<any[]>([]);

  onMount(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/dashboard/evolucion-ventas`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      setVentasMensuales(data.ventasMensuales);

      const labels = data.ventasMensuales.map((item: any) => item._id);
      const totals = data.ventasMensuales.map((item: any) => item.totalVentas);

      const ctx = canvasRef?.getContext("2d");
      if (ctx) {
        new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [{
              label: "Total Ventas ($)",
              data: totals,
              fill: false,
              borderColor: "rgba(255, 99, 132, 1)",
              tension: 0.1
            }]
          },
          options: {
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }
    } catch (error) {
      console.error("Error en EvolucionVentasChart:", error);
    }
  });

  return (
    <div class="bg-white shadow-md rounded p-4">
      <h2 class="text-xl font-semibold mb-4">Evolución de Ventas Mensuales</h2>
      <canvas ref={canvasRef} class="w-full h-64"></canvas>
    </div>
  );
};

export default EvolucionVentasChart;
