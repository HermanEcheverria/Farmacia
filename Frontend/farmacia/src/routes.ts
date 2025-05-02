
import { lazy, createComponent, type Component } from "solid-js";
import { useNavigate, type RouteDefinition } from "@solidjs/router";

/** Todos los roles posibles */
export type UserRole =
  | "admin"
  | "empleado"
  | "paciente"
  | "interconexiones"
  | "sin-registrar";


// src/routes.ts
function getCurrentUser(): { role: UserRole } | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    // el payload JWT va en la segunda parte, base64
    const [, payloadB64] = token.split(".");
    const { role } = JSON.parse(atob(payloadB64)) as { role: UserRole };
    return { role };
  } catch {
    return null;
  }
}



/**
 * HOC para proteger rutas sin usar JSX en este TS.
 * @param PageComponent Componente de la página a renderizar.
 * @param allowedRoles Lista de roles permitidos (vacío = público).
 */
function withAuth(
  PageComponent: Component,
  allowedRoles: UserRole[] = []
): Component {
  const AuthWrapper: Component = () => {
    const user = getCurrentUser();
    const nav  = useNavigate();

    // Si no está logueado → login
    if (!user) {
      nav("/login", { replace: true });
      return null;
    }

    // Si tiene roles definidos y el suyo no está incluido → unauthorized
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      nav("/unauthorized", { replace: true });
      return null;
    }

    // OK: render del PageComponent
    return createComponent(PageComponent, {});
  };

  return AuthWrapper;
}

// 1. Lazy-load de componentes
const Home                     = lazy(() => import("./pages/home"));
const subhome                  = lazy(() => import("./pages/subhome"));
const subhome2                 = lazy(() => import("./pages/subhome2"));
const Signup                   = lazy(() => import("./pages/signup"));
const Login                    = lazy(() => import("./pages/login"));
const PortalAdmin              = lazy(() => import("./pages/PortalAdmin"));
const AdminUsuarios            = lazy(() => import("./pages/admin"));
const AdminMedicamentos        = lazy(() => import("./pages/adminMedicamentos"));
const AdminPagesManager        = lazy(() => import("./pages/AdminPagesManager"));
const SolicitarReceta          = lazy(() => import("./pages/SolicitarReceta"));
const SearchMedicamentos       = lazy(() => import("./pages/SearchMedicamentos"));
const MedicamentoDetalle       = lazy(() => import("./pages/MedicamentoDetalle"));
const Dashboard                = lazy(() => import("./pages/Dashboard"));
const DiscountPage             = lazy(() => import("./pages/DiscountPage"));
const DynamicPage              = lazy(() => import("./pages/DynamicPage"));
const SolicitudFarmacia        = lazy(() => import("./pages/SolicitudFarmacia"));
const DraftView                = lazy(() => import("./pages/DraftView"));
const ModeracionAdminView      = lazy(() => import("./pages/ModeracionAdminView"));
const SolicitudesDescuentoPage = lazy(() => import("./components/SolicitudesDescuentoPage"));
const Unauthorized             = lazy(() => import("./errors/401"));  

// 2. Definición de rutas
export const routes: RouteDefinition[] = [
  // PÚBLICAS
  { path: "/",                         component: Home },
  { path: "/subhome",                  component: subhome },
  { path: "/subhome2",                 component: subhome2 },
  { path: "/signup",                   component: Signup },
  { path: "/login",                    component: Login },
  { path: "/discount",                 component: DiscountPage },
  { path: "/:slug",                    component: DynamicPage },

  // RUTAS ABIERTAS TRAS LOGIN (sin restricción de rol)
  {
    path: "/solicitarReceta",
    component: withAuth(SolicitarReceta)
  },
  {
    path: "/searchMedicamentos",
    component: withAuth(SearchMedicamentos)
  },
  {
    path: "/medicamentos/:id",
    component: withAuth(MedicamentoDetalle)
  },
  {
    path: "/dashboard",
    component: withAuth(Dashboard)
  },
  {
    path: "/ver-solicitudes",
    component: withAuth(SolicitudesDescuentoPage)
  },

  // RUTAS DE ADMINISTRACIÓN
  {
    path: "/admin",
    component: withAuth(PortalAdmin, ["admin", "empleado"])
  },
  {
    path: "/admin/usuarios",
    component: withAuth(AdminUsuarios, ["admin"])
  },
  {
    path: "/admin/medicamentos",
    component: withAuth(AdminMedicamentos, ["admin", "empleado"])
  },
  {
    path: "/admin/pages",
    component: withAuth(AdminPagesManager, ["admin", "empleado"])
  },
  {
    path: "/admin/solicitudFarmacia",
    component: withAuth(SolicitudFarmacia, ["admin", "empleado"])
  },
  {
    path: "/admin/moderacion",
    component: withAuth(ModeracionAdminView, ["admin"])
  },

  // RUTAS DE MODERACIÓN DE Borradores
  {
    path: "/moderacion/draft/:id",
    component: DraftView
  },

  // PÁGINA NO AUTORIZADO
  {
    path: "/unauthorized",
    component: Unauthorized
  },

  // CUALQUIER OTRA → 404
  {
    path: "(.*)",
    component: lazy(() => import("./errors/404"))
  }
];


