import { createSignal, createResource, Show, For } from "solid-js";
import { useParams } from "@solidjs/router";
import { API_URL } from "../utils/api";

const fetchMedicamento = async (id) => {
  const response = await fetch(`${API_URL}/medicamentos/${id}`);
  return response.json();
};

export default function MedicamentoDetalle() {
  const { id } = useParams();
  const [medicamento, { refetch }] = createResource(() => id, fetchMedicamento);
  const [comentario, setComentario] = createSignal("");
  const [respuestaA, setRespuestaA] = createSignal(null);

  const agregarComentario = async () => {
    if (!comentario().trim()) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para comentar.");
      return;
    }
  
    const response = await fetch(`${API_URL}/medicamentos/${id}/comentarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify({ texto: comentario(), respuestaA: respuestaA() }),
    });
  
    if (response.ok) {
      setComentario("");
      setRespuestaA(null);
      refetch(); // Recargar los comentarios
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.error}`);
    }
  };
  
  const ComentarioComponent = (props) => (
    <div class="border p-2 mb-2">
      <p class="font-semibold">{props.comentario.texto}</p>
      <small class="text-gray-500">Usuario: {props.comentario.user?.email || "Anónimo"}</small>
      <Show when={localStorage.getItem("token")}>
        <button class="text-blue-500 text-sm ml-2" onClick={() => setRespuestaA(props.comentario._id)}>
          Responder
        </button>
      </Show>
      <div class="ml-6 border-l pl-2 mt-2">
        <For each={props.comentario.respuestas}>
          {(respuesta) => <ComentarioComponent comentario={respuesta} />}
        </For>
      </div>
    </div>
  );
  
  return (
    <div class="p-4">
      <Show when={medicamento()}>
        <h1 class="text-2xl font-bold">{medicamento().nombre}</h1>
        <p><strong>Principio Activo:</strong> {medicamento().principioActivo}</p>
        <p><strong>Descripción:</strong> {medicamento().descripcion}</p>
        <p><strong>Categoría:</strong> {medicamento().categoria}</p>
        <p><strong>Precio:</strong> ${medicamento()?.precio ? medicamento().precio.toFixed(2) : "No disponible"}</p>

        <h2 class="text-xl mt-6">Comentarios</h2>
        <div class="mt-2">
          <For each={medicamento().comentarios}>
            {(c) => <ComentarioComponent comentario={c} />}
          </For>
        </div>

        <Show when={localStorage.getItem("token")}>
          <textarea
            class="border p-2 w-full mt-4"
            placeholder="Escribe un comentario..."
            value={comentario()}
            onInput={(e) => setComentario(e.target.value)}
          ></textarea>
          <button class="mt-2 bg-blue-500 text-white p-2 rounded" onClick={agregarComentario}>
            {respuestaA() ? "Responder Comentario" : "Enviar Comentario"}
          </button>
        </Show>
      </Show>
    </div>
  );
}
