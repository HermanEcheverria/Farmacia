import { useNavigate } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import { API_URL } from "../utils/api";
import { getUser } from "../utils/auth";

export default function AdminPagesManager() {
  const navigate = useNavigate();
  const [pages, setPages] = createSignal<any[]>([]);
  const [selectedPage, setSelectedPage] = createSignal<any>(null);
  const [title, setTitle] = createSignal("");
  const [slug, setSlug] = createSignal("");
  const [content, setContent] = createSignal("");
  const [enabled, setEnabled] = createSignal(true);
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const user = getUser();

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No autenticado");

      const res = await fetch(`${API_URL}/pages/admin`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!res.ok) throw new Error("Error al cargar páginas");
      const data = await res.json();
      setPages(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  onMount(fetchPages);

  const handleSelect = (page: any) => {
    setSelectedPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setEnabled(page.enabled);
  };

  const clearForm = () => {
    setSelectedPage(null);
    setTitle("");
    setSlug("");
    setContent("");
    setEnabled(true);
    setError("");
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!user || !user.email) throw new Error("Usuario no autenticado");

      const payload = {
        slug: slug(),
        nuevoContenido: content(),
        email: user.email,
        pagina: title(),
      };

      const res = await fetch(`${API_URL}/moderacion-pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar propuesta");
      }

      alert("✅ Propuesta enviada para moderación");
      clearForm();
      fetchPages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/pages/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!res.ok) throw new Error("Error al eliminar la página");
      await fetchPages();
      if (selectedPage() && selectedPage()._id === id) {
        clearForm();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleEnabled = async (id: string, nuevoEstado: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/pages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: nuevoEstado })
      });
      if (!res.ok) throw new Error("Error al actualizar el estado de la página");
      await fetchPages();
      if (selectedPage() && selectedPage()._id === id) {
        setEnabled(nuevoEstado);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div class="container mx-auto py-8 px-4">
      <div class="bg-[rgba(0,171,189,0.05)] border border-[#00ABBD] rounded-2xl shadow-md p-6">
        <h1 class="text-3xl font-bold mb-6 text-center text-[#024059]">Administrar Páginas</h1>
        {error() && <p class="text-red-600 mb-4">{error()}</p>}
        <div class="flex flex-col lg:flex-row gap-8">
          {/* Listado de páginas */}
          <div class="lg:w-1/2">
            <h2 class="text-xl font-semibold mb-4 text-[#026873]">Listado de Páginas</h2>
            <ul class="space-y-4">
              {pages().map((page) => (
                <li class="bg-white p-4 border border-[#A1C7E0] rounded-lg shadow flex justify-between items-center">
                  <div>
                    <p class="font-semibold text-[#024059]">{page.title}</p>
                    <p class="text-sm text-[#026E81]">Slug: {page.slug}</p>
                    <p class="text-sm text-[#026873]">Estado: {page.enabled ? "Habilitada" : "Deshabilitada"}</p>
                  </div>
                  <div class="flex space-x-3">
                    <button onClick={() => handleSelect(page)} class="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => toggleEnabled(page._id, !page.enabled)} class="text-orange-600 hover:underline">
                      {page.enabled ? "Deshabilitar" : "Habilitar"}
                    </button>
                    <button onClick={() => handleDelete(page._id)} class="text-red-600 hover:underline">Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={clearForm}
              class="mt-4 bg-[#04BF8A] text-white px-4 py-2 rounded hover:bg-[#03A66A] transition font-semibold"
            >
              Crear Nueva Página
            </button>
          </div>

          {/* Formulario de propuesta */}
          <div class="lg:w-1/2">
            <h2 class="text-xl font-semibold mb-4 text-[#026873]">
              {selectedPage() ? "Proponer Edición de Página" : "Proponer Nueva Página"}
            </h2>
            <form onSubmit={handleSubmit} class="space-y-4">
              <div>
                <label class="block font-semibold mb-1 text-[#024059]">Título:</label>
                <input
                  type="text"
                  value={title()}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  class="w-full p-3 border border-[#026873] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ABBD]"
                  required
                />
              </div>
              <div>
                <label class="block font-semibold mb-1 text-[#024059]">Slug:</label>
                <input
                  type="text"
                  value={slug()}
                  onInput={(e) => setSlug(e.currentTarget.value)}
                  class="w-full p-3 border border-[#026873] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ABBD]"
                  required
                />
              </div>
              <div>
                <label class="block font-semibold mb-1 text-[#024059]">Contenido (HTML):</label>
                <textarea
                  value={content()}
                  onInput={(e) => setContent(e.currentTarget.value)}
                  rows="6"
                  class="w-full p-3 border border-[#026873] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ABBD]"
                  required
                ></textarea>
              </div>
              <div class="space-x-4">
                <button
                  type="submit"
                  disabled={loading()}
                  class="bg-[#FF9933] text-white px-5 py-2 rounded-md hover:bg-[#e57d00] transition font-semibold"
                >
                  {loading() ? "Enviando..." : "Enviar a Moderación"}
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  class="bg-gray-600 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
