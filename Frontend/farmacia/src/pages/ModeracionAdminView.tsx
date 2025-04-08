import { createSignal, onMount, Show, For } from "solid-js";
import { API_URL } from "../../src/utils/api";
import { sendModeracionRechazoEmail } from "../../src/utils/emailModeracion";

export default function ModeracionAdminView() {
  const [propuestas, setPropuestas] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [comentario, setComentario] = createSignal("");

  const fetchPropuestas = async () => {
    try {
      const res = await fetch(`${API_URL}/moderacion-pages/estado/pendiente`);
      const data = await res.json();
      setPropuestas(data);
    } catch (err) {
      console.error("Error al cargar propuestas:", err);
    } finally {
      setLoading(false);
    }
  };

  const aprobar = async (id: string) => {
    await fetch(`${API_URL}/moderacion-pages/aprobar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    fetchPropuestas();
  };

  const rechazar = async (id: string, email: string, slug: string) => {
    if (!comentario()) return alert("Debes escribir el motivo del rechazo");
    await fetch(`${API_URL}/moderacion-pages/rechazar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comentarioRechazo: comentario() }),
    });

    // Enviar correo desde frontend
    const link = `http://192.168.1.8:3000/moderacion/draft/${id}`;
    await sendModeracionRechazoEmail(email, comentario(), link, slug);

    setComentario("");
    fetchPropuestas();
  };

  onMount(fetchPropuestas);

  return (
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">🛡️ Panel de Moderación</h1>

      <Show when={loading()}>
        <p>Cargando propuestas...</p>
      </Show>

      <Show when={!loading() && propuestas().length === 0}>
        <p>No hay propuestas pendientes.</p>
      </Show>

      <For each={propuestas()}>
        {(prop) => (
          <div class="border p-4 rounded mb-4 shadow">
            <p><strong>Slug:</strong> {prop.slug}</p>
            <p><strong>Email:</strong> {prop.email}</p>

            <label class="block mt-2 font-semibold">Contenido propuesto:</label>
            <div class="bg-gray-100 p-2 mt-1 rounded max-h-60 overflow-auto whitespace-pre-wrap">
              {prop.nuevoContenido}
            </div>

            <label class="block mt-3">Motivo de rechazo:</label>
            <textarea
              rows="2"
              class="w-full p-2 border rounded my-2"
              value={comentario()}
              onInput={(e) => setComentario(e.currentTarget.value)}
            ></textarea>

            <div class="flex gap-3">
              <button
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                onClick={() => aprobar(prop._id)}
              >
                Aprobar
              </button>
              <button
                class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                onClick={() => rechazar(prop._id, prop.email, prop.slug)}
              >
                Rechazar
              </button>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
