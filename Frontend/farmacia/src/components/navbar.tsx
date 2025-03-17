import { A } from "@solidjs/router";
import { createSignal } from "solid-js";
import { getUser, logout } from "../utils/auth"; // ✅ Importamos autenticación

const Navbar = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const user = getUser(); // ✅ Obtener usuario autenticado

  return (
    <nav class="bg-blue-600 text-white shadow-md">
      <div class="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <A href="/" class="text-2xl font-bold tracking-wide">MediSync</A>

        {/* Botón para menú en móviles */}
        <button
          class="lg:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen())}
        >
          <i class="bi bi-list text-3xl"></i>
        </button>

        {/* Menú de navegación */}
        <ul class={`lg:flex space-x-6 ${isOpen() ? "block" : "hidden"} lg:flex items-center`}>
          <li><A href="/" class="hover:text-gray-200 transition">Inicio</A></li>
          <li><A href="/historia" class="hover:text-gray-200 transition">Historia</A></li>
          <li><A href="/faq" class="hover:text-gray-200 transition">FAQ</A></li>
          <li><A href="/contacto" class="hover:text-gray-200 transition">Contacto</A></li>
          <li><A href="/searchMedicamentos" class="hover:text-gray-200 transition">Buscar Medicamentos</A></li>

          {/* Si el usuario está autenticado */}
          {user ? (
            <>
              {/* Mostrar "Admin" solo si el usuario es admin */}
              {user.role === "admin" && (
                <li><A href="/admin" class="hover:text-gray-200 transition">Admin</A></li>
              )}
              <li><A href="/dashboard" class="hover:text-gray-200 transition">Panel</A></li>
              <li>
                <button
                  class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                  onClick={logout}
                >
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <li>
              <A href="/login" class="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                Iniciar Sesión
              </A>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
