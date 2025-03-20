import { createSignal, createResource, Show, For } from "solid-js";
import { useParams } from "@solidjs/router";
import { API_URL } from "../utils/api";

// Recurso para obtener el detalle del medicamento
const fetchMedicamento = async (id: string) => {
  const response = await fetch(`${API_URL}/medicamentos/${id}`);
  return response.json();
};

// Recurso para obtener la jerarquía de comentarios
const fetchComentarios = async (id: string) => {
  const response = await fetch(`${API_URL}/medicamentos/${id}/comentarios`);
  return response.json();
};

export default function MedicamentoDetalle() {
  const { id } = useParams();
  const [medicamento, { refetch: refetchMedicamento }] = createResource(() => id, fetchMedicamento);
  const [fetchedComentarios, { refetch: refetchComentarios }] = createResource(() => id, fetchComentarios);

  // Signal para el nuevo comentario raíz
  const [nuevoComentario, setNuevoComentario] = createSignal("");
  const [currentImageIndex, setCurrentImageIndex] = createSignal(0);

  // Función para navegar entre imágenes
  const nextImage = () => {
    if (medicamento()?.fotos?.length) {
      setCurrentImageIndex((prev) =>
        prev === medicamento().fotos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (medicamento()?.fotos?.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? medicamento().fotos.length - 1 : prev - 1
      );
    }
  };

  const agregarComentario = async (parentId: string = "root", texto: string) => {
    if (!texto.trim()) return;

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
      body: JSON.stringify({ texto, respuestaA: parentId === "root" ? null : parentId }),
    });

    if (response.ok) {
      setNuevoComentario("");
      refetchComentarios();
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.error}`);
    }
  };

  // Componente recursivo para renderizar cada comentario y sus respuestas
  const ComentarioComponent = (props: { comentario: any }) => {
    const [respuestaTexto, setRespuestaTexto] = createSignal("");
    const [mostrarRespuesta, setMostrarRespuesta] = createSignal(false);

    return (
      <div class="border p-4 mb-4 rounded-lg shadow-md bg-gray-100">
        <p class="font-semibold text-gray-800">{props.comentario.texto}</p>
        <small class="text-gray-600">
          Usuario: {props.comentario.user?.email || props.comentario.user?.nombre || "Anónimo"}
        </small>
        <Show when={localStorage.getItem("token")}>
          <button
            class="text-blue-600 text-sm font-medium ml-2 hover:underline"
            onClick={() => setMostrarRespuesta(!mostrarRespuesta())}
          >
            {mostrarRespuesta() ? "Cancelar" : "Responder"}
          </button>
          <Show when={mostrarRespuesta()}>
            <div class="mt-3">
              <textarea
                class="border p-2 w-full rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                placeholder="Escribe tu respuesta..."
                value={respuestaTexto()}
                onInput={(e) => setRespuestaTexto(e.target.value)}
              ></textarea>
              <button
                class="mt-2 bg-blue-500 text-white font-medium p-2 rounded-lg hover:bg-blue-600 transition"
                onClick={async () => {
                  await agregarComentario(props.comentario._id, respuestaTexto());
                  setRespuestaTexto("");
                  setMostrarRespuesta(false);
                }}
              >
                Enviar Respuesta
              </button>
            </div>
          </Show>
        </Show>
        <div class="ml-6 border-l-2 border-gray-300 pl-4 mt-4">
          <For each={props.comentario.respuestas}>
            {(respuesta) => <ComentarioComponent comentario={respuesta} />}
          </For>
        </div>
      </div>
    );
  };

  return (
    <div class="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <Show when={medicamento()}>
        <h1 class="text-3xl font-bold text-gray-900">{medicamento().nombre}</h1>

        {/* 🔹 Carrusel de Imágenes */}
        <Show when={medicamento().fotos?.length > 0}>
          <div class="relative w-full h-64 mt-4">
            <img
              src={medicamento().fotos[currentImageIndex()]}
              class="w-full h-64 object-cover rounded-lg shadow-md"
            />
            <Show when={medicamento().fotos.length > 1}>
              <button
                class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg hover:bg-opacity-75 transition-all"
                onClick={prevImage}
              >
                ❮
              </button>
              <button
                class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg hover:bg-opacity-75 transition-all"
                onClick={nextImage}
              >
                ❯
              </button>
            </Show>
          </div>
        </Show>

        <p class="text-gray-700 mt-2">
          <strong>Principio Activo:</strong> {medicamento().principioActivo}
        </p>
        <p class="text-gray-700">
          <strong>Descripción:</strong> {medicamento().descripcion}
        </p>
        <p class="text-gray-700">
          <strong>Categoría:</strong> {medicamento().categoria}
        </p>
        <p class="text-gray-800 font-semibold mt-2">
          <strong>Precio:</strong> ${medicamento()?.precio ? medicamento().precio.toFixed(2) : "No disponible"}
        </p>

        <h2 class="text-2xl font-semibold text-gray-900 mt-6">Comentarios</h2>
        <div class="mt-4 space-y-4">
          <For each={fetchedComentarios()}>
            {(c) => <ComentarioComponent comentario={c} />}
          </For>
        </div>

        <Show when={localStorage.getItem("token")}>
          <div class="mt-6 bg-gray-100 p-4 rounded-lg shadow-md">
            <textarea
              class="border p-3 w-full rounded-lg shadow-sm focus:ring focus:ring-blue-300"
              placeholder="Escribe un comentario..."
              value={nuevoComentario()}
              onInput={(e) => setNuevoComentario(e.target.value)}
            ></textarea>
            <button
              type="button"
              class="mt-3 bg-blue-500 text-white font-medium p-2 rounded-lg hover:bg-blue-600 transition"
              onClick={async () => {
                await agregarComentario("root", nuevoComentario());
                setNuevoComentario("");
              }}
            >
              Enviar Comentario
            </button>
          </div>
        </Show>
      </Show>
    </div>
  );
}
