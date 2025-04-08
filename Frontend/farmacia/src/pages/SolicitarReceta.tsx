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

      setReceta(data);
    } catch (err: any) {
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
          tieneAprobacionSeguro: true
        })
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);
      if (!response.ok) throw new Error(data.error || "Error al procesar la compra");

      setMensajeCompra(data.mensaje || "Compra procesada exitosamente");
      if (data.pdfFactura) {
        setPdfFactura(data.pdfFactura);
      }
    } catch (err: any) {
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
    <div class="p-8 bg-[#ffffff] min-h-screen flex flex-col items-center">
      <h1 class="text-3xl font-bold mb-6 text-[#024059] text-center">Solicitar Receta</h1>

      <div class="bg-white border border-[#00ABBD] p-6 rounded-2xl shadow-md w-full max-w-md">
        <label class="block text-lg font-semibold text-[#026E81] mb-2">Código de Receta</label>
        <input
          type="text"
          class="border border-[#026E81] p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#00ABBD] mb-4"
          placeholder="Ingrese el código de la receta"
          value={codigoReceta()}
          onInput={(e) => setCodigoReceta(e.currentTarget.value)}
        />
        <button
          class="bg-[#0099DD] hover:bg-[#007cb2] text-white px-4 py-2 rounded-md w-full font-semibold transition"
          onClick={() => solicitarReceta(codigoReceta())}
        >
          Solicitar Receta
        </button>
      </div>

      {error() && <p class="text-red-600 mt-4">{error()}</p>}

      {receta() && (
        <div class="bg-white border border-[#A1C7E0] p-6 mt-6 rounded-2xl shadow-md w-full max-w-2xl">
          <h2 class="text-2xl font-bold text-[#024059] mb-4">Detalles de la Receta</h2>
          <p class="text-[#026873]"><strong>Código:</strong> {codigoReceta()}</p>
          <h3 class="text-xl font-semibold text-[#026E81] mt-4 mb-2">Medicamentos</h3>
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
              class="bg-[#04BF8A] hover:bg-[#03a577] text-white px-4 py-2 rounded-md mt-6 w-full font-semibold transition"
              onClick={comprarReceta}
            >
              Proceder con la Compra
            </button>
          ) : (
            <p class="text-red-600 mt-4">No se puede completar la receta por falta de medicamentos.</p>
          )}

          {mensajeCompra() && (
            <div class="mt-6 text-center">
              <p class="text-green-600 font-semibold">{mensajeCompra()}</p>
              {pdfFactura() && (
                <button
                  class="mt-4 bg-[#FF9933] hover:bg-[#e68500] text-white px-4 py-2 rounded-md font-semibold transition"
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
