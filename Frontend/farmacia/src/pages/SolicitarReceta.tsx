import { createSignal } from "solid-js";
import { API_URL } from "../utils/api";

export default function SolicitarReceta() {
  const [codigoReceta, setCodigoReceta] = createSignal("");
  const [receta, setReceta] = createSignal<any>(null);
  const [error, setError] = createSignal("");
  const [mensajeCompra, setMensajeCompra] = createSignal("");
  const [pdfFactura, setPdfFactura] = createSignal("");

  const solicitarReceta = async (codigo: string) => {
    setError("");
    setReceta(null);
    setMensajeCompra("");
    setPdfFactura("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/recetas/solicitar/${codigo}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al solicitar la receta");
  
      console.log("✅ Receta obtenida:", data);
      setReceta(data);
    } catch (err: any) {
      console.error("❌ Error:", err.message);
      setError(err.message);
    }
  };

  const comprarReceta = async () => {
    setError("");
    setMensajeCompra("");
    setPdfFactura("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/recetas/comprar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: codigoReceta(),
          tieneAprobacionSeguro: true  // Ajusta según corresponda
        })
      });
  
      // Depurar la respuesta
      const responseText = await response.text();
      console.log("Respuesta cruda del endpoint /comprar:", responseText);
  
      // Intentar parsear el JSON
      const data = JSON.parse(responseText);
      if (!response.ok) throw new Error(data.error || "Error al procesar la compra");
  
      console.log("✅ Compra procesada:", data);
      setMensajeCompra(data.mensaje || "Compra procesada exitosamente");
      if (data.pdfFactura) {
        setPdfFactura(data.pdfFactura);
      }
    } catch (err: any) {
      console.error("❌ Error:", err.message);
      setError(err.message);
    }
  };
  
  const descargarFactura = () => {
    if (pdfFactura()) {
      const linkSource = `data:application/pdf;base64,${pdfFactura()}`;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = "factura.pdf";
      downloadLink.click();
    }
  };

  return (
    <div class="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 class="text-3xl font-bold mb-6 text-center">Solicitar Receta</h1>

      <div class="bg-white p-6 shadow-lg rounded-lg w-full max-w-md">
        <label class="block text-lg font-semibold mb-2">Código de Receta</label>
        <input
          type="text"
          class="border p-2 w-full mb-4"
          placeholder="Ingrese el código de la receta"
          value={codigoReceta()}
          onInput={(e) => setCodigoReceta(e.currentTarget.value)}
        />
        <button 
          class="bg-blue-500 text-white px-4 py-2 rounded w-full" 
          onClick={() => solicitarReceta(codigoReceta())}
        >
          Solicitar Receta
        </button>
      </div>

      {error() && <p class="text-red-600 mt-4">{error()}</p>}

      {receta() && (
        <div class="bg-white p-6 shadow-lg rounded-lg mt-6 w-full max-w-2xl">
          <h2 class="text-2xl font-semibold mb-4">Detalles de la Receta</h2>
          <p><strong>Código:</strong> {codigoReceta()}</p>
          <h3 class="text-xl font-semibold mt-4 mb-2">Medicamentos</h3>
          <ul class="list-disc pl-6">
            {receta().medicamentos.map((med: any) => (
              <li class={med.disponible ? "text-green-600" : "text-red-600"}>
                {med.nombre} - {med.cantidad} unidades
                {med.disponible ? " ✅ Disponible" : " ❌ No disponible"}
              </li>
            ))}
          </ul>

          {receta().medicamentos.every((m: any) => m.disponible) ? (
            <button 
              class="bg-green-500 text-white px-4 py-2 rounded mt-4 w-full"
              onClick={comprarReceta}
            >
              Proceder con la Compra
            </button>
          ) : (
            <p class="text-red-600 mt-4">No se puede completar la receta por falta de medicamentos.</p>
          )}

          {mensajeCompra() && (
            <div class="mt-4">
              <p class="text-green-600 font-semibold">{mensajeCompra()}</p>
              {pdfFactura() && (
                <button 
                  class="bg-purple-500 text-white px-4 py-2 rounded mt-4"
                  onClick={descargarFactura}
                >
                  Descargar Factura PDF
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
