import { A } from "@solidjs/router";

export default function PortalAdmin() {
  return (
    <div >
      <div class="bg-[rgba(0,171,189,0.05)] border border-[#00ABBD] rounded-2xl shadow-md p-6 max-w-5xl mx-auto">
        <h1 class="text-3xl font-bold mb-6 text-center text-[#024059]">Panel de Administración</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <A href="/admin/usuarios" class="bg-white p-6 shadow-md rounded-xl text-center hover:shadow-lg border border-[#A1C7E0] transition">
            <h2 class="text-2xl font-semibold mb-2 text-[#026873]">Gestión de Usuarios</h2>
            <p class="text-gray-600">Activar y gestionar usuarios</p>
          </A>

          <A href="/admin/medicamentos" class="bg-white p-6 shadow-md rounded-xl text-center hover:shadow-lg border border-[#A1C7E0] transition">
            <h2 class="text-2xl font-semibold mb-2 text-[#026873]">Gestión de Medicamentos</h2>
            <p class="text-gray-600">Agregar, editar y eliminar medicamentos</p>
          </A>

          <A href="/solicitarReceta" class="bg-white p-6 shadow-md rounded-xl text-center hover:shadow-lg border border-[#A1C7E0] transition">
            <h2 class="text-2xl font-semibold mb-2 text-[#026873]">Solicitar Receta</h2>
            <p class="text-gray-600">Solicitar una receta médica</p>
          </A>

          <A href="/ver-solicitudes" class="bg-white p-6 shadow-md rounded-xl text-center hover:shadow-lg border border-[#A1C7E0] transition">
            <h2 class="text-2xl font-semibold mb-2 text-[#026873]">Descuentos</h2>
            <p class="text-gray-600">Aprobacion de solicitudes con descuento</p>
          </A>

          <A href="/dashboard" class="bg-white p-6 shadow-md rounded-xl text-center hover:shadow-lg border border-[#A1C7E0] transition">
            <h2 class="text-2xl font-semibold mb-2 text-[#026873]">Dashboard</h2>
            <p class="text-gray-600">Ver métricas y estadísticas</p>
          </A>

          <A href="/admin/pages" class="bg-white p-6 shadow-md rounded-xl text-center hover:shadow-lg border border-[#A1C7E0] transition">
            <h2 class="text-2xl font-semibold mb-2 text-[#026873]">Gestión de Páginas</h2>
            <p class="text-gray-600">Administrar páginas del sitio web</p>
          </A>

          <A href="/admin/moderacion" class="bg-white p-6 shadow-md rounded-xl text-center hover:shadow-lg border border-[#A1C7E0] transition">
            <h2 class="text-2xl font-semibold mb-2 text-[#026873]">Moderación</h2>
            <p class="text-gray-600">Revisar contenido propuesto</p>
          </A>
        </div>
      </div>
    </div>
  );
}
