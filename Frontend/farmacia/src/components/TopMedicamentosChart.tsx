import { createSignal, onMount } from "solid-js";
import Chart from "chart.js/auto";
import { API_URL } from "../utils/api";

const TopMedicamentosChart = () => {
  let canvasRef: HTMLCanvasElement | undefined;
  const [medicamentos, setMedicamentos] = createSignal<any[]>([]);

  onMount(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/dashboard/top-medicamentos`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      setMedicamentos(data.medicamentos);

      const labels = data.medicamentos.map((item: any) => item.medicamento);
      const totals = data.medicamentos.map((item: any) => item.totalVentas);

      const ctx = canvasRef?.getContext("2d");
      if (ctx) {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [{
              label: "Total Ventas (unidades)",
              data: totals,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1
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
      console.error("Error en TopMedicamentosChart:", error);
    }
  });

  return (
    <div class="bg-white shadow-md rounded p-4">
      <h2 class="text-xl font-semibold mb-4">Top 10 Medicamentos Más Vendidos</h2>
      <canvas ref={canvasRef} class="w-full h-64"></canvas>
    </div>
  );
};

export default TopMedicamentosChart;
