import { createSignal, createEffect, For } from "solid-js";
import API_URL from "../utils/api";

export default function AdminMedicamentos() {
  const [medicamentos, setMedicamentos] = createSignal([]);
  const [error, setError] = createSignal("");
  const [nombre, setNombre] = createSignal("");
  const [codigo, setCodigo] = createSignal("");
  const [categoria, setCategoria] = createSignal("");
  const [precio, setPrecio] = createSignal("");
  const [stock, setStock] = createSignal("");
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);

  createEffect(async () => {
    try {
      const response = await fetch(`${API_URL}/medicamentos/listar`);
      if (!response.ok) throw new Error("Error obteniendo medicamentos");
      setMedicamentos(await response.json());
    } catch (err) {
      setError("No se pudieron cargar los medicamentos");
    }
  });

  const agregarMedicamento = async () => {
    try {
      const response = await fetch(`${API_URL}/medicamentos/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          codigo: codigo(),
          nombre: nombre(),
          categoria: categoria(),
          precio: parseFloat(precio()),
          stock: parseInt(stock()),
        }),
      });

      if (!response.ok) throw new Error("Error al agregar medicamento");

      setNombre("");
      setCodigo("");
      setCategoria("");
      setPrecio("");
      setStock("");

      // Recargar lista de medicamentos
      const data = await response.json();
      setMedicamentos([...medicamentos(), data]);
    } catch (err) {
      console.error("Error agregando medicamento:", err);
      setError("No se pudo agregar el medicamento.");
    }
  };

  const eliminarMedicamento = async (codigo: string) => {
    try {
      const response = await fetch(`${API_URL}/medicamentos/eliminar/${codigo}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Error al eliminar medicamento");

      setMedicamentos(medicamentos().filter((m) => m.codigo !== codigo));
    } catch (err) {
      console.error("Error eliminando medicamento:", err);
      setError("No se pudo eliminar el medicamento.");
    }
  };

  const handleFileUpload = async (codigo: string) => {
    if (!selectedFile()) return;

    const formData = new FormData();
    formData.append("imagen", selectedFile()!);

    try {
      const response = await fetch(`${API_URL}/medicamentos/upload/${codigo}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al subir la imagen");

      alert("Imagen subida con éxito");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
    }
  };

  return (
    <div class="p-8 bg-gray-100 min-h-screen">
      <h1 class="text-3xl font-bold mb-6 text-center">Gestión de Medicamentos</h1>
      {error() && <p class="text-red-600 mb-4">{error()}</p>}

      {/* Formulario para agregar un medicamento */}
      <div class="bg-white p-6 shadow-lg rounded-lg mb-6 max-w-md mx-auto">
        <h2 class="text-2xl font-semibold mb-4">Agregar Medicamento</h2>
        <input type="text" placeholder="Código" class="border p-2 w-full mb-2" value={codigo()} onInput={(e) => setCodigo(e.currentTarget.value)} />
        <input type="text" placeholder="Nombre" class="border p-2 w-full mb-2" value={nombre()} onInput={(e) => setNombre(e.currentTarget.value)} />
        <input type="text" placeholder="Categoría" class="border p-2 w-full mb-2" value={categoria()} onInput={(e) => setCategoria(e.currentTarget.value)} />
        <input type="number" placeholder="Precio" class="border p-2 w-full mb-2" value={precio()} onInput={(e) => setPrecio(e.currentTarget.value)} />
        <input type="number" placeholder="Stock" class="border p-2 w-full mb-2" value={stock()} onInput={(e) => setStock(e.currentTarget.value)} />
        <button class="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2" onClick={agregarMedicamento}>Agregar</button>
      </div>

      {/* Tabla de medicamentos */}
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-200">
              <th class="border p-2">Código</th>
              <th class="border p-2">Nombre</th>
              <th class="border p-2">Categoría</th>
              <th class="border p-2">Precio</th>
              <th class="border p-2">Stock</th>
              <th class="border p-2">Imagen</th>
              <th class="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <For each={medicamentos()}>
              {(medicamento) => (
                <tr class="bg-white hover:bg-gray-100">
                  <td class="border p-2">{medicamento.codigo}</td>
                  <td class="border p-2">{medicamento.nombre}</td>
                  <td class="border p-2">{medicamento.categoria}</td>
                  <td class="border p-2">${medicamento.precio.toFixed(2)}</td>
                  <td class="border p-2">{medicamento.stock}</td>
                  <td class="border p-2">
                    {medicamento.fotos.length > 0 ? (
                      <img src={`${API_URL}/medicamentos/image/${medicamento.fotos[0]}`} class="h-12 w-12 object-cover" />
                    ) : (
                      "Sin imagen"
                    )}
                  </td>
                  <td class="border p-2">
                    <button class="bg-red-500 text-white px-2 py-1 rounded mr-2" onClick={() => eliminarMedicamento(medicamento.codigo)}>
                      Eliminar
                    </button>
                    <input type="file" class="mb-2" onChange={(e) => setSelectedFile(e.currentTarget.files?.[0] || null)} />
                    <button class="bg-blue-500 text-white px-2 py-1 rounded mt-2" onClick={() => handleFileUpload(medicamento.codigo)}>
                      Subir Imagen
                    </button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}