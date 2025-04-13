import { createSignal, createEffect, Component } from "solid-js";
import { API_URL } from "../utils/api";  // Asegúrate que API_URL apunte al backend de Aseguradora

const DiscountPage: Component = () => {
  const [medicamentos, setMedicamentos] = createSignal([]);
  const [solicitudData, setSolicitudData] = createSignal({
    medicamentoId: "",
    farmacia: "",
    porcentajeDescuento: 0,
  });
  const [responseMsg, setResponseMsg] = createSignal("");

  // Obtener medicamentos desde el backend (se redirige a Farmacia)
  createEffect(() => {
    fetch(`${API_URL}/medicamentos/listar`)
      .then((res) => res.json())
      .then(setMedicamentos)
      .catch((error) => {
        console.error("Error obteniendo medicamentos:", error);
      });
  });

  // Función para enviar la solicitud de descuento
  const handleSolicitar = async () => {
    try {
      const response = await fetch(`${API_URL}/discount/solicitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(solicitudData()),
      });
      const data = await response.json();
      if (response.ok) {
        setResponseMsg("Solicitud enviada correctamente");
      } else {
        setResponseMsg(data.error);
      }
    } catch (error) {
      console.error("Error enviando solicitud:", error);
      setResponseMsg("Error enviando solicitud");
    }
  };

  return (
    <div class="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 class="text-2xl font-bold text-center text-blue-600 mb-6">
        Solicitar Descuento
      </h1>
      <div class="flex flex-col gap-4">
        <select
          class="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={solicitudData().medicamentoId}
          onInput={(e) =>
            setSolicitudData({
              ...solicitudData(),
              medicamentoId: e.currentTarget.value,
            })
          }
        >
          <option value="">Selecciona un medicamento</option>
          {medicamentos().map((med) => (
            <option value={med._id}>{med.nombre}</option>
          ))}
        </select>
        <input
          type="text"
          class="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Nombre de Farmacia"
          onInput={(e) =>
            setSolicitudData({
              ...solicitudData(),
              farmacia: e.currentTarget.value,
            })
          }
        />
        <input
          type="number"
          class="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="% Descuento"
          onInput={(e) =>
            setSolicitudData({
              ...solicitudData(),
              porcentajeDescuento: Number(e.currentTarget.value),
            })
          }
        />
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition"
          onClick={handleSolicitar}
        >
          Enviar solicitud
        </button>
        {responseMsg() && (
          <p class="text-center text-green-600 font-medium">{responseMsg()}</p>
        )}
      </div>
    </div>
  );
};

export default DiscountPage;