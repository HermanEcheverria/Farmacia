import type { Component } from "solid-js";
import { A } from "@solidjs/router";

const Unauthorized: Component = () => {
  return (
    <div class="container my-5 text-center">
      <h1 class="display-4 text-danger">401 – No autorizado</h1>
      <p class="lead">
        Lo sentimos, no tienes permiso para acceder a esta página.
      </p>
      <div class="mt-4">
        <A href="/login" class="btn btn-primary me-2">
          Iniciar sesión
        </A>
        <A href="/" class="btn btn-outline-secondary">
          Volver al inicio
        </A>
      </div>
    </div>
  );
};

export default Unauthorized;
