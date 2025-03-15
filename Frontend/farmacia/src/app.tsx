import { Suspense, type Component } from "solid-js";
import { useLocation } from "@solidjs/router";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

const App: Component = (props: { children: Element }) => {
  const location = useLocation();

  return (
    <>
      {/* Navbar Global */}
      <Navbar />

      {/* Barra informativa con la URL actual */}
      <nav class="bg-gray-200 text-gray-900 px-4 py-2 text-sm text-center">
        <span>Estás en: </span>
        <span class="font-semibold">{location.pathname}</span>
      </nav>

      {/* Contenedor de la Aplicación */}
      <main class="container mx-auto py-6">
        <Suspense>{props.children}</Suspense>
      </main>

      {/* Footer Global */}
      <Footer />
    </>
  );
};

export default App;
