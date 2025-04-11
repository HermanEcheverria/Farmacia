import { lazy } from "solid-js";
import type { RouteDefinition } from "@solidjs/router";
import Home from "./pages/home";

export const routes: RouteDefinition[] = [
  { path: "/", component: Home },
  { path: "/signup", component: lazy(() => import("./pages/signup")) },
  { path: "/login", component: lazy(() => import("./pages/login")) },
  { path: "/admin", component: lazy(() => import("./pages/PortalAdmin")) },
  { path: "/admin/usuarios", component: lazy(() => import("./pages/admin")) },
  { path: "/admin/medicamentos", component: lazy(() => import("./pages/adminMedicamentos")) },
  { path: "/admin/pages", component: lazy(() => import("./pages/AdminPagesManager")) },
  { path: "/solicitarReceta", component: lazy(() => import("./pages/SolicitarReceta")) },
  { path: "/searchMedicamentos", component: lazy(() => import("./pages/SearchMedicamentos")) },
  { path: "/medicamentos/:id", component: lazy(() => import("./pages/MedicamentoDetalle")) },
  { path: "/dashboard", component: lazy(() => import("./pages/Dashboard")) },
  { path: "/:slug", component: lazy(() => import("./pages/DynamicPage")) },
  {path: "/admin/solicitudFarmacia", component: lazy(() => import("./pages/SolicitudFarmacia"))},
  {path: "/moderacion/draft/:id", component: lazy(() => import("./pages/DraftView"))},
  {path: "/admin/moderacion", component: lazy(() => import("./pages/ModeracionAdminView"))},

  { path: "**", component: lazy(() => import("./errors/404")) },
];
