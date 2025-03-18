import { A } from "@solidjs/router";

export default function PortalAdmin() {
  return (
    <div class="p-8 bg-gray-100 min-h-screen">
      <h1 class="text-3xl font-bold mb-6 text-center">Panel de Administración</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <A href="/admin/usuarios" class="bg-white p-6 shadow-lg rounded-lg text-center">
          <h2 class="text-2xl font-semibold mb-4">Gestión de Usuarios</h2>
          <p class="text-gray-600">Activar y gestionar usuarios</p>
        </A>
        <A href="/admin/medicamentos" class="bg-white p-6 shadow-lg rounded-lg text-center">
          <h2 class="text-2xl font-semibold mb-4">Gestión de Medicamentos</h2>
          <p class="text-gray-600">Agregar, editar y eliminar medicamentos</p>
        </A>
        <A href="/solicitarReceta" class="bg-white p-6 shadow-lg rounded-lg text-center">
          <h2 class="text-2xl font-semibold mb-4">Solicitar Receta</h2>
          <p class="text-gray-600">Solicitar una receta médica</p>
        </A>
      </div>
    </div>
  );
}