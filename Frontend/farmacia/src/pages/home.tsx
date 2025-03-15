import { A } from "@solidjs/router";
import { getUser } from "../utils/auth";

export default function Home() {
  const user = getUser(); // Obtiene el usuario actual

  return (
    <section class="bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Hero Section */}
      <header class="w-full bg-blue-600 text-white py-16 text-center">
        <div class="container mx-auto px-4">
          <h1 class="text-4xl font-bold">Bienvenido a MediSync - Farmacia</h1>
          <p class="mt-4 text-lg">
            La mejor solución para la gestión de medicamentos, recetas e inventario.
          </p>
          {!user && (
            <A href="/signup" class="mt-6 inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
              Crear Cuenta
            </A>
          )}
        </div>
      </header>

      {/* Sección de Servicios */}
      <section class="container mx-auto py-12 px-4">
        <h2 class="text-3xl font-bold text-center text-gray-800">Nuestros Servicios</h2>

        {user ? (
          <div class="text-center text-green-700 text-lg font-semibold mt-6">
            Bienvenido, <span class="text-blue-600">{user.email}</span>. Tu rol es <span class="text-red-600">{user.role}</span>.
          </div>
        ) : (
          <div class="text-center text-gray-600 mt-6">
            Inicia sesión para acceder a todas las funcionalidades.
          </div>
        )}

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Gestión de Recetas */}
          <div class="bg-white p-6 shadow-lg rounded-lg text-center">
            <i class="bi bi-file-earmark-medical text-blue-600 text-5xl"></i>
            <h3 class="text-xl font-semibold mt-4">Gestión de Recetas</h3>
            <p class="mt-2 text-gray-600">
              Administra recetas médicas de manera eficiente y segura.
            </p>
          </div>

          {/* Inventario Inteligente */}
          <div class="bg-white p-6 shadow-lg rounded-lg text-center">
            <i class="bi bi-box-seam text-green-600 text-5xl"></i>
            <h3 class="text-xl font-semibold mt-4">Inventario Inteligente</h3>
            <p class="mt-2 text-gray-600">
              Controla el stock y evita faltantes en medicamentos.
            </p>
          </div>

          {/* Integración con Hospitales */}
          <div class="bg-white p-6 shadow-lg rounded-lg text-center">
            <i class="bi bi-hospital text-red-600 text-5xl"></i>
            <h3 class="text-xl font-semibold mt-4">Integración con Hospitales</h3>
            <p class="mt-2 text-gray-600">
              Conéctate con hospitales y aseguradoras de forma segura.
            </p>
          </div>
        </div>
      </section>

      {/* CTA - Llamado a la acción */}
      <section class="w-full bg-blue-600 text-white py-12 text-center">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold">Únete a MediSync</h2>
          <p class="mt-4 text-lg">
            Regístrate hoy y lleva tu farmacia al siguiente nivel con nuestra plataforma digital.
          </p>
          {user ? (
            <A href="/dashboard" class="mt-6 inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
              Ir al Panel de Control
            </A>
          ) : (
            <A href="/signup" class="mt-6 inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
              Comenzar Ahora
            </A>
          )}
        </div>
      </section>
    </section>
  );
}
