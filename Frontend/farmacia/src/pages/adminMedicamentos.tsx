import { createSignal, createEffect, For } from "solid-js";
import API_URL from "../utils/api";

export default function AdminMedicamentos() {
  const [medicamentos, setMedicamentos] = createSignal([]);
  const [error, setError] = createSignal("");

  // Estados para los campos del medicamento
  const [codigo, setCodigo] = createSignal("");
  const [nombre, setNombre] = createSignal("");
  const [categoria, setCategoria] = createSignal("");
  const [precio, setPrecio] = createSignal("");
  const [stock, setStock] = createSignal("");
  const [farmaceutica, setFarmaceutica] = createSignal("");
  const [unidadesPorPresentacion, setUnidadesPorPresentacion] = createSignal("");
  const [presentacion, setPresentacion] = createSignal("");
  const [concentracion, setConcentracion] = createSignal("");
  const [principioActivo, setPrincipioActivo] = createSignal("");

  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [isEditing, setIsEditing] = createSignal(false);

  // Cargar la lista de medicamentos
  createEffect(async () => {
    try {
      console.log("🔍 Usando API_URL:", API_URL);
      console.log("🔍 Solicitando medicamentos desde:", `${API_URL}/medicamentos/listar`);

      const response = await fetch(`${API_URL}/medicamentos/listar`);
      if (!response.ok) throw new Error("Error obteniendo medicamentos");

      const data = await response.json();
      console.log("✅ Medicamentos recibidos:", data);
      setMedicamentos(data);
    } catch (err) {
      console.error("❌ Error obteniendo medicamentos:", err);
      setError("No se pudieron cargar los medicamentos");
    }
  });

  // Agregar o editar un medicamento
  const guardarMedicamento = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error("❌ No hay token almacenado en localStorage");
      setError("No hay token de autenticación. Inicia sesión nuevamente.");
      return;
    }
  
    const medicamentoData = {
      codigo: codigo(),
      nombre: nombre(),
      categoria: categoria(),
      precio: parseFloat(precio()),
      stock: parseInt(stock()),
      farmaceutica: farmaceutica(),
      unidadesPorPresentacion: parseInt(unidadesPorPresentacion()),
      presentacion: presentacion(),
      concentracion: concentracion(),
      principioActivo: principioActivo(),
    };
  
    console.log("🔍 Enviando datos al backend:", medicamentoData);
  
    try {
      const response = await fetch(`${API_URL}/medicamentos/${codigo()}`, { 
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(medicamentoData),
      });
        
      const responseData = await response.json();
  
      if (!response.ok) {
        console.error("❌ Respuesta del backend:", responseData);
        throw new Error(responseData.error || `Error al ${isEditing() ? 'editar' : 'agregar'} medicamento`);
      }
  
      console.log(`✅ Medicamento ${isEditing() ? 'editado' : 'agregado'} con éxito:`, responseData);
      if (isEditing()) {
        setMedicamentos(medicamentos().map(m => m.codigo === codigo() ? responseData : m));
      } else {
        setMedicamentos([...medicamentos(), responseData]);
      }
  
      // Limpiar el formulario
      setCodigo("");
      setNombre("");
      setCategoria("");
      setPrecio("");
      setStock("");
      setFarmaceutica("");
      setUnidadesPorPresentacion("");
      setPresentacion("");
      setConcentracion("");
      setPrincipioActivo("");
      setIsEditing(false);
    } catch (err) {
      console.error(`❌ Error ${isEditing() ? 'editando' : 'agregando'} medicamento:`, err);
      setError(`No se pudo ${isEditing() ? 'editar' : 'agregar'} el medicamento.`);
    }
  };

  // Función para cargar los datos del medicamento en el formulario
  const cargarDatosMedicamento = (medicamento) => {
    setCodigo(medicamento.codigo);
    setNombre(medicamento.nombre);
    setCategoria(medicamento.categoria);
    setPrecio(medicamento.precio.toString());
    setStock(medicamento.stock.toString());
    setFarmaceutica(medicamento.farmaceutica);
    setUnidadesPorPresentacion(medicamento.unidadesPorPresentacion.toString());
    setPresentacion(medicamento.presentacion);
    setConcentracion(medicamento.concentracion);
    setPrincipioActivo(medicamento.principioActivo);
    setIsEditing(true);
  };

  // Eliminar un medicamento
  const eliminarMedicamento = async (codigo: string) => {
    try {
      const response = await fetch(`${API_URL}/medicamentos/${codigo}`, {
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

  // Subir una imagen de medicamento
  const handleFileUpload = async (codigo: string) => {
    if (!selectedFile()) {
      console.error("❌ No se seleccionó ningún archivo.");
      return;
    }

    console.log(`🔍 Subiendo imagen para el medicamento con código: ${codigo}`);

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

      console.log("✅ Imagen subida con éxito");
      alert("Imagen subida con éxito");
      setSelectedFile(null);
    } catch (error) {
      console.error("❌ Error subiendo imagen:", error);
    }
  };

  return (
    <div class="p-8 bg-gray-100 min-h-screen">
      <h1 class="text-3xl font-bold mb-6 text-center">Gestión de Medicamentos</h1>
      {error() && <p class="text-red-600 mb-4">{error()}</p>}

      {/* Formulario para agregar o editar un medicamento */}
      <div class="bg-white p-6 shadow-lg rounded-lg mb-6 max-w-md mx-auto">
        <h2 class="text-2xl font-semibold mb-4">{isEditing() ? "Editar Medicamento" : "Agregar Medicamento"}</h2>
        <input type="text" placeholder="Código" class="border p-2 w-full mb-2" value={codigo()} onInput={(e) => setCodigo(e.currentTarget.value)} disabled={isEditing()} />
        <input type="text" placeholder="Nombre" class="border p-2 w-full mb-2" value={nombre()} onInput={(e) => setNombre(e.currentTarget.value)} />
        <input type="text" placeholder="Categoría" class="border p-2 w-full mb-2" value={categoria()} onInput={(e) => setCategoria(e.currentTarget.value)} />
        <input type="number" placeholder="Precio" class="border p-2 w-full mb-2" value={precio()} onInput={(e) => setPrecio(e.currentTarget.value)} />
        <input type="number" placeholder="Stock" class="border p-2 w-full mb-2" value={stock()} onInput={(e) => setStock(e.currentTarget.value)} />
        <input type="text" placeholder="Farmacéutica" class="border p-2 w-full mb-2" value={farmaceutica()} onInput={(e) => setFarmaceutica(e.currentTarget.value)} />
        <input type="number" placeholder="Unidades por Presentación" class="border p-2 w-full mb-2" value={unidadesPorPresentacion()} onInput={(e) => setUnidadesPorPresentacion(e.currentTarget.value)} />
        <input type="text" placeholder="Presentación" class="border p-2 w-full mb-2" value={presentacion()} onInput={(e) => setPresentacion(e.currentTarget.value)} />
        <input type="text" placeholder="Concentración" class="border p-2 w-full mb-2" value={concentracion()} onInput={(e) => setConcentracion(e.currentTarget.value)} />
        <input type="text" placeholder="Principio Activo" class="border p-2 w-full mb-2" value={principioActivo()} onInput={(e) => setPrincipioActivo(e.currentTarget.value)} />
        <button class="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2" onClick={guardarMedicamento}>{isEditing() ? "Guardar Cambios" : "Agregar"}</button>
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
                    <button class="bg-red-500 text-white px-2 py-1 rounded mr-2" onClick={() => eliminarMedicamento(medicamento.codigo)}>Eliminar</button>
                    <button class="bg-green-500 text-white px-2 py-1 rounded mr-2" onClick={() => cargarDatosMedicamento(medicamento)}>Editar</button>
                    <input type="file" class="mb-2" onChange={(e) => setSelectedFile(e.currentTarget.files?.[0] || null)} />
                    <button class="bg-blue-500 text-white px-2 py-1 rounded mt-2" onClick={() => handleFileUpload(medicamento.codigo)}>Subir Imagen</button>
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