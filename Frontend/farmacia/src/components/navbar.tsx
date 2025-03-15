import { A } from "@solidjs/router";
import { createSignal } from "solid-js";

const Navbar = () => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <nav class="bg-blue-600 text-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <A href="/" class="text-2xl font-bold">MediSync</A>

        {/* Botón para menú en móviles */}
        <button 
          class="lg:hidden text-white focus:outline-none" 
          onClick={() => setIsOpen(!isOpen())}
        >
          <i class="bi bi-list text-3xl"></i>
        </button>

        {/* Menú de navegación */}
        <ul class={`lg:flex space-x-6 ${isOpen() ? "block" : "hidden"} lg:block`}>
          <li><A href="/" class="hover:text-gray-200">Inicio</A></li>
          <li><A href="/historia" class="hover:text-gray-200">Historia</A></li>
          <li><A href="/faq" class="hover:text-gray-200">FAQ</A></li>
          <li><A href="/contacto" class="hover:text-gray-200">Contacto</A></li>
          <li><A href="/login" class="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-200">Iniciar Sesión</A></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
