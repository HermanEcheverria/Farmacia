import TopCategoriesChart from "../components/TopCategoriesChart";
import EvolucionVentasChart from "../components/EvolucionVentasChart";
import TopMedicamentosChart from "../components/TopMedicamentosChart";

const Dashboard = () => {
  return (
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">Dashboard de Administrador</h1>
        <div class="grid grid-cols-1 gap-6">
          {/* Gráfica 1: Top 10 Categorías de Medicamentos Más Vendidos */}
          <TopCategoriesChart />

          {/* Gráfica 2: Evolución de Ventas Mensuales */}
          <EvolucionVentasChart />

          {/* Gráfica 3: Top 10 Medicamentos Más Vendidos */}
          <TopMedicamentosChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
