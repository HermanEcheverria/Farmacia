import { lazy } from "solid-js";
import type { RouteDefinition } from "@solidjs/router";
import Home from "./pages/home";

export const routes: RouteDefinition[] = [
  { path: "/", component: Home },
  { path: "/about", component: lazy(() => import("./pages/about")) },
  { path: "/signup", component: lazy(() => import("./pages/signup")) },
  { path: "/login", component: lazy(() => import("./pages/login")) },
  { path: "/admin", component: lazy(() => import("./pages/PortalAdmin")) }, 
  { path: "/admin/usuarios", component: lazy(() => import("./pages/admin")) }, 
  { path: "/admin/medicamentos", component: lazy(() => import("./pages/adminMedicamentos")) }, 
  {path: "/solicitarReceta", component: lazy(() => import("./pages/SolicitarReceta"))},
  {path: "/searchMedicamentos", component: lazy(() => import("./pages/SearchMedicamentos"))},
  { path: "/medicamentos/:id", component: lazy(() => import("./pages/MedicamentoDetalle")) }, 
  { path: "**", component: lazy(() => import("./errors/404")) },
];
