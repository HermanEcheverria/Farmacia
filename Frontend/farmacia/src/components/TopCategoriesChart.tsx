import { createSignal, onMount } from "solid-js";
import Chart from "chart.js/auto";
import { API_URL } from "../utils/api";

const TopCategoriesChart = () => {
  let canvasRef: HTMLCanvasElement | undefined;
  const [categories, setCategories] = createSignal<any[]>([]);

  onMount(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/dashboard/top-categories`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setCategories(data.categories);

      const ctx = canvasRef?.getContext("2d");
      if (ctx) {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: data.categories.map((cat: any) => cat.categoria),
            datasets: [
              {
                label: "Porcentaje de Ventas",
                data: data.categories.map((cat: any) => Number(cat.porcentaje)),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value: number) => `${value}%`,
                },
              },
            },
          },
        });
      }
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  });

  return (
    <div class="bg-white shadow-md rounded p-4">
      <h2 class="text-xl font-semibold mb-4">
        Top 10 Categorías de Medicamentos Más Vendidos
      </h2>
      <canvas ref={canvasRef} class="w-full h-64"></canvas>
    </div>
  );
};

export default TopCategoriesChart;
