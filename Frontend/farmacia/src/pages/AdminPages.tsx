import { createSignal } from "solid-js";
import { API_URL } from "../utils/api";
import { getUser } from "../utils/auth";
import { useNavigate } from "@solidjs/router";

export default function AdminPageForm() {
  const [title, setTitle] = createSignal("");
  const [slug, setSlug] = createSignal("");
  const [content, setContent] = createSignal("");
  const [enabled, setEnabled] = createSignal(true);
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No autenticado");
      
      const payload = {
        title: title(),
        slug: slug(),
        content: content(),
        enabled: enabled(),
      };

      const res = await fetch(`${API_URL}/pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear la página");
      }

      // Redirige a la lista de páginas tras crear la página
      navigate("/admin/pages");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="container mx-auto py-8 px-4">
      <h1 class="text-3xl font-bold mb-4">Crear Nueva Página</h1>
      {error() && <p class="text-red-600 mb-4">{error()}</p>}
      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="block font-semibold mb-1">Título:</label>
          <input
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            class="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label class="block font-semibold mb-1">Slug:</label>
          <input
            type="text"
            value={slug()}
            onInput={(e) => setSlug(e.currentTarget.value)}
            class="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label class="block font-semibold mb-1">Contenido (HTML):</label>
          <textarea
            value={content()}
            onInput={(e) => setContent(e.currentTarget.value)}
            rows="6"
            class="w-full border p-2 rounded"
            required
          ></textarea>
        </div>
        <div class="flex items-center">
          <input
            type="checkbox"
            checked={enabled()}
            onChange={(e) => setEnabled(e.currentTarget.checked)}
            id="enabled"
            class="mr-2"
          />
          <label for="enabled" class="font-semibold">Habilitada</label>
        </div>
        <div class="space-x-4">
          <button
            type="submit"
            disabled={loading()}
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {loading() ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/pages")}
            class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
