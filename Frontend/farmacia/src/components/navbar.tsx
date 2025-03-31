// src/components/navbar.tsx
import { A } from "@solidjs/router";
import { usePages } from "../pages/pageStore";
import { createSignal } from "solid-js";
import { getUser, logout } from "../utils/auth";

const Navbar = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const user = getUser();
  const { pages } = usePages(); // Obtiene la lista de páginas

  return (
    <nav class="bg-blue-600 text-white shadow-md">
      <div class="container mx-auto px-6 py-4 flex justify-between items-center">
        <A href="/" class="text-2xl font-bold tracking-wide">
          MediSync
        </A>

        <button
          class="lg:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen())}
        >
          <i class="bi bi-list text-3xl"></i>
        </button>

        <ul class="lg:flex space-x-6 items-center">
          <li>
            <A href="/" class="hover:text-gray-200 transition">
              Inicio
            </A>
          </li>
          <li> 
            <A href="/searchMedicamentos" class="hover:text-gray-200 transition">
              Buscar
            </A>
          </li>
         

          {/* Links dinámicos: por ejemplo, si creas nuevas páginas */}
          {pages().map((page) => (
            <li>
              <A href={`/${page.slug}`} class="hover:text-gray-200 transition">
                {page.title}
              </A>
            </li>
          ))}

          {user ? (
            <>
              {user.role === "admin" && (
                <li>
                  <A href="/admin" class="hover:text-gray-200 transition">
                    Admin
                  </A>
                </li>
              )}
              <li>
                <A href="/dashboard" class="hover:text-gray-200 transition">
                  Panel
                </A>
              </li>
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
              <A
                href="/login"
                class="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
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
