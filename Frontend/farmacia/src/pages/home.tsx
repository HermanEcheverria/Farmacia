import { A } from "@solidjs/router";
import { getUser } from "../utils/auth";
import FeaturedMedications from "../components/FeaturedMedications";
import ActivePromotions    from "../components/elementosHome/ActivePromotions";
import PharmacyRequests    from "../components/elementosHome/PharmacyRequests";

export default function Home() {
  const user = getUser();

  return (
    <section class="min-h-screen flex flex-col">

      {/* Hero Section */}
      <header class="relative w-full bg-gradient-to-r from-farmacia-primary-1 to-farmacia-primary-2 text-white py-24 text-center">
        <div class="container mx-auto px-4">
          <h1 class="text-5xl font-bold mb-4">Bienvenido a Portal Farmacia</h1>
          <p class="text-xl mb-8">
            La mejor solución para la gestión de medicamentos, recetas e inventario.
          </p>
          {user ? (
            <A href="/dashboard" class="btn-primary">Ir al Panel</A>
          ) : (
            <A href="/signup"    class="btn-primary">Crear Cuenta</A>
          )}
        </div>
      </header>

      {/* Servicios */}
      <section class="container mx-auto py-16 px-4">
        <h2 class="text-4xl font-bold text-center text-blue-900 mb-12">NUESTROS SERVICIOS</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        </div>
      </section>


      <ActivePromotions />
      <PharmacyRequests />
      <FeaturedMedications />

      {/* Acerca del Portal */}
      <section class="container mx-auto py-16 px-4">
        <h2 class="text-4xl font-bold text-center text-gray-800 mb-8">Acerca de Portal Farmacia</h2>
        <p class="text-center text-lg text-gray-700 max-w-3xl mx-auto">
          MediSync es la plataforma digital que revoluciona…
        </p>
      </section>

      {/* CTA */}
      <section class="w-full bg-farmacia-primary-1 text-white py-12 text-center">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold">Únete a MediSync</h2>
          <p class="mt-4 text-lg">Regístrate hoy y lleva tu farmacia al siguiente nivel.</p>
          {user ? (
            <A href="/dashboard" class="btn-primary mt-6">Ir al Panel</A>
          ) : (
            <A href="/signup"    class="btn-primary mt-6">Comenzar Ahora</A>
          )}
        </div>
      </section>
    </section>
  );
}
