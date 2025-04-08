import { useParams, useNavigate } from "@solidjs/router";
import { createResource, createSignal, createEffect, Show } from "solid-js";
import { API_URL } from "../../src/utils/api";

const fetchPropuesta = async (id: string) => {
  const res = await fetch(`${API_URL}/moderacion-pages/${id}`);
  if (!res.ok) throw new Error("Error al cargar propuesta");
  return await res.json();
};

export default function DraftView() {
  const params = useParams();
  const navigate = useNavigate();
  const [contenido, setContenido] = createSignal("");
  const [propuesta] = createResource(() => params.id, fetchPropuesta);

  createEffect(() => {
    if (propuesta()) {
      setContenido(propuesta().nuevoContenido);
    }
  });

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/moderacion-pages/reenviar/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoContenido: contenido() }),
      });

      if (!res.ok) throw new Error("Error al reenviar propuesta");

      alert("✅ Propuesta reenviada correctamente");
      navigate("/"); // Puedes redirigir a /moderacion o donde tengas tu panel principal
    } catch (err) {
      console.error(err);
      alert("❌ Error al reenviar la propuesta");
    }
  };

  return (
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">📝 Corregir Propuesta Rechazada</h1>

      <Show when={propuesta.loading}>
        <p>Cargando propuesta...</p>
      </Show>

      <Show when={propuesta()}>
        <p><strong>Slug de la página:</strong> {propuesta().slug}</p>
        <p class="text-red-600"><strong>Motivo del rechazo:</strong> {propuesta().comentarioRechazo}</p>

        <label class="block mt-4 font-semibold">Nuevo Contenido (HTML):</label>
        <textarea
          rows="10"
          class="w-full p-2 border rounded my-2"
          value={contenido()}
          onInput={(e) => setContenido(e.currentTarget.value)}
        ></textarea>

        <button
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={handleSubmit}
        >
          Reenviar Propuesta
        </button>
      </Show>
    </div>
  );
}
