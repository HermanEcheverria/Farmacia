// src/components/SolicitudFarmaciaView.tsx
import { Component, createSignal, createResource } from "solid-js";

// Define el tipo Aseguradora (ajusta según tu modelo real)
type Aseguradora = {
  _id: string;
  nombre: string;
};

const fetchAseguradoras = async (): Promise<Aseguradora[]> => {
  const response = await fetch("http://localhost:5001/api/seguros");
  if (!response.ok) {
    throw new Error("Error al obtener aseguradoras");
  }
  return response.json();
};

const SolicitudFarmaciaView: Component = () => {
  // Estados para los campos del formulario
  const [nombre, setNombre] = createSignal<string>("");
  const [direccion, setDireccion] = createSignal<string>("");
  const [telefono, setTelefono] = createSignal<string>("");
  const [aseguradora, setAseguradora] = createSignal<string>("");

  const [loading, setLoading] = createSignal<boolean>(false);
  const [mensaje, setMensaje] = createSignal<string>("");

  // Cargar aseguradoras mediante createResource
  const [aseguradoras] = createResource(fetchAseguradoras);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    const payload = {
      nombre: nombre(),
      direccion: direccion(),
      telefono: telefono(),
      aseguradora: aseguradora(), 
      origen: "farmacia"
    };

    try {
      const response = await fetch("http://localhost:5000/farmacia/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log("Respuesta del servidor:", result);
      setMensaje("¡Solicitud enviada exitosamente!");
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setMensaje("Error al enviar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="m-8">
      <h1 class="text-2xl font-bold mb-4">Enviar Solicitud de Farmacia</h1>
      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-gray-700">
            Nombre:
            <input
              type="text"
              value={nombre()}
              onInput={(e) => setNombre((e.target as HTMLInputElement).value)}
              required
              class="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </label>
        </div>
        <div>
          <label class="block text-gray-700">
            Dirección:
            <input
              type="text"
              value={direccion()}
              onInput={(e) => setDireccion((e.target as HTMLInputElement).value)}
              required
              class="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </label>
        </div>
        <div>
          <label class="block text-gray-700">
            Teléfono:
            <input
              type="text"
              value={telefono()}
              onInput={(e) => setTelefono((e.target as HTMLInputElement).value)}
              required
              class="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </label>
        </div>
        {/* Campo para seleccionar la aseguradora */}
        <div>
          <label class="block text-gray-700">
            Aseguradora:
            <select
              value={aseguradora()}
              onChange={(e) => setAseguradora((e.target as HTMLSelectElement).value)}
              required
              class="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Seleccione una aseguradora</option>
              {!aseguradoras.loading && aseguradoras()?.map((aseg) => (
                <option value={aseg._id}>{aseg.nombre}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <button
            type="submit"
            disabled={loading()}
            class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading() ? "Enviando..." : "Enviar Solicitud"}
          </button>
        </div>
      </form>
      {mensaje() && <p class="mt-4 text-green-600">{mensaje()}</p>}
    </div>
  );
};

export default SolicitudFarmaciaView;
