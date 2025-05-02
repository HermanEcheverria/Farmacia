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

    const link = `http://192.168.56.1:3005/moderacion/draft/${id}`;
    await sendModeracionRechazoEmail(email, comentario(), link, slug);

    setComentario("");
    fetchPropuestas();
  };

  onMount(fetchPropuestas);

  return (
    <div class="container mx-auto p-6">
      <div class="bg-[rgba(0,171,189,0.05)] border border-[#00ABBD] rounded-2xl shadow-md p-6">
        <h1 class="text-3xl font-bold mb-6 text-center text-[#024059]">🛡️ Panel de Moderación</h1>

        <Show when={loading()}>
          <p class="text-center text-[#026E81]">Cargando propuestas...</p>
        </Show>

        <Show when={!loading() && propuestas().length === 0}>
          <p class="text-center text-[#026E81]">No hay propuestas pendientes.</p>
        </Show>

        <For each={propuestas()}>
          {(prop) => (
            <div class="border border-[#A1C7E0] bg-white p-4 rounded-xl shadow-sm mb-6">
              <p class="text-[#026873] font-medium mb-1"><strong>Slug:</strong> {prop.slug}</p>
              <p class="text-[#026873] font-medium mb-3"><strong>Email:</strong> {prop.email}</p>

              <label class="block font-semibold text-[#024059]">Contenido propuesto:</label>
              <div class="bg-[#E6F9F5] p-3 mt-1 rounded max-h-60 overflow-auto whitespace-pre-wrap text-sm text-[#024059]">
                {prop.nuevoContenido}
              </div>

              <label class="block mt-4 text-sm font-medium text-[#024059]">Motivo de rechazo:</label>
              <textarea
                rows="2"
                class="w-full p-3 border border-[#026873] rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-[#00ABBD]"
                value={comentario()}
                onInput={(e) => setComentario(e.currentTarget.value)}
              ></textarea>

              <div class="flex gap-4 mt-4">
                <button
                  class="bg-[#04BF8A] text-white px-5 py-2 rounded-md hover:bg-[#03A66A] transition font-semibold"
                  onClick={() => aprobar(prop._id)}
                >
                  Aprobar
                </button>
                <button
                  class="bg-[#FF9933] text-white px-5 py-2 rounded-md hover:bg-[#e88200] transition font-semibold"
                  onClick={() => rechazar(prop._id, prop.email, prop.slug)}
                >
                  Rechazar
                </button>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
