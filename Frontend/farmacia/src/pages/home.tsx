// src/pages/Home.tsx
import { A } from "@solidjs/router";
import { getUser } from "../utils/auth";
import FeaturedMedications from "../components/FeaturedMedications";

export default function Home() {
  const user = getUser();

  return (
    <section class="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header class="relative w-full bg-gradient-to-r from-farmacia-primary-1 to-farmacia-primary-2 text-white py-24 text-center">
        <div class="container mx-auto px-4">
          <h1 class="text-5xl font-bold mb-4">
            Bienvenido a Portal Farmacia
          </h1>
          <p class="text-xl mb-8">
            La mejor solución para la gestión de medicamentos, recetas e
            inventario.
          </p>
          {user ? (
            <A
              href="/dashboard"
              class="inline-block bg-white text-farmacia-primary-1 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
            >
              Ir al Panel de Control
            </A>
          ) : (
            <A
              href="/signup"
              class="inline-block bg-white text-farmacia-primary-1 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
            >
              Crear Cuenta
            </A>
          )}
        </div>
      </header>

      {/* Servicios */}
      <section class="container mx-auto py-16 px-4">
        <h2 class="text-4xl font-bold text-center text-gray-800 mb-12">
          Nuestros Servicios
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Gestión de Recetas */}
          <div class="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center">
            <i class="bi bi-file-earmark-medical text-farmacia-secondary-1 text-6xl mb-4"></i>
            <h3 class="text-2xl font-semibold mb-2">Gestión de Recetas</h3>
            <p class="text-gray-600">
              Administra recetas médicas de manera eficiente y segura.
            </p>
          </div>
          {/* Inventario Inteligente */}
          <div class="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center">
            <i class="bi bi-box-seam text-farmacia-secondary-2 text-6xl mb-4"></i>
            <h3 class="text-2xl font-semibold mb-2">Inventario Inteligente</h3>
            <p class="text-gray-600">
              Busqueda de Medicamentos 
            </p>
          </div>
          {/* Integración con Hospitales */}
          <div class="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center">
            <i class="bi bi-hospital text-farmacia-secondary-3 text-6xl mb-4"></i>
            <h3 class="text-2xl font-semibold mb-2">Integración con Hospitales</h3>
            <p class="text-gray-600">
              Conéctate con hospitales y aseguradoras de forma segura.
            </p>
          </div>
        </div>
      </section>

      {/* Medicamentos Destacados */}
      <FeaturedMedications />

      {/* Acerca del Portal Farmacia */}
      <section class="container mx-auto py-16 px-4">
        <h2 class="text-4xl font-bold text-center text-gray-800 mb-8">
          Acerca de Portal Farmacia
        </h2>
        <p class="text-center text-lg text-gray-700 max-w-3xl mx-auto">
          MediSync es la plataforma digital que revoluciona la gestión de medicamentos, recetas e inventario en farmacias. Con una interfaz intuitiva, reportes en tiempo real e integración segura con hospitales y aseguradoras, te ofrecemos todas las herramientas para optimizar el funcionamiento de tu farmacia.
        </p>
      </section>

      {/* CTA - Llamado a la acción */}
      <section class="w-full bg-farmacia-primary-1 text-white py-12 text-center">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold">Únete a MediSync</h2>
          <p class="mt-4 text-lg">
            Regístrate hoy y lleva tu farmacia al siguiente nivel con nuestra plataforma digital.
          </p>
          {user ? (
            <A
              href="/dashboard"
              class="mt-6 inline-block bg-white text-farmacia-primary-1 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
            >
              Ir al Panel de Control
            </A>
          ) : (
            <A
              href="/signup"
              class="mt-6 inline-block bg-white text-farmacia-primary-1 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
            >
              Comenzar Ahora
            </A>
          )}
        </div>
      </section>
    </section>
  );
}
