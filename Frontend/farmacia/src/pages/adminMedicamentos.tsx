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
  const [fotos, setFotos] = createSignal<string[]>([]); 
  const [fotoInput, setFotoInput] = createSignal("");
  const [isEditing, setIsEditing] = createSignal(false);
  const [descripcion, setDescripcion] = createSignal("");
  const [requiereReceta, setRequiereReceta] = createSignal(false);

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
      fotos: fotos(), // 📌 Ahora enviamos URLs de imágenes
      descripcion: descripcion(),
      requiereReceta: requiereReceta(),
    };

    console.log("🔍 Enviando datos al backend:", medicamentoData);

    try {
      const response = await fetch(
        `${API_URL}/medicamentos/${isEditing() ? codigo() : "crear"}`,
        {
          method: isEditing() ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(medicamentoData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        console.error("❌ Respuesta del backend:", responseData);
        throw new Error(responseData.error || `Error al ${isEditing() ? "editar" : "agregar"} medicamento`);
      }

      console.log(`✅ Medicamento ${isEditing() ? "editado" : "agregado"} con éxito:`, responseData);
      if (isEditing()) {
        setMedicamentos(medicamentos().map((m) => (m.codigo === codigo() ? responseData : m)));
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
      setFotos([]);
      setFotoInput("");
      setIsEditing(false);
      setDescripcion("");
      setRequiereReceta(false);
    } catch (err) {
      console.error(`❌ Error ${isEditing() ? "editando" : "agregando"} medicamento:`, err);
      setError(`No se pudo ${isEditing() ? "editar" : "agregar"} el medicamento.`);
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
    setFotos(medicamento.fotos || []); // 📌 Cargar las URLs de imágenes
    setIsEditing(true);
    setDescripcion(medicamento.descripcion);
    setRequiereReceta(medicamento.requiereReceta);
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

  return (
    <div class="p-8 bg-gray-100 min-h-screen">
      <h1 class="text-3xl font-bold mb-6 text-center">Gestión de Medicamentos</h1>
      {error() && <p class="text-red-600 mb-4">{error()}</p>}
  
      {/* Formulario para agregar o editar un medicamento */}
      <div class="bg-white p-6 shadow-lg rounded-lg mb-6 max-w-md mx-auto">
        <h2 class="text-2xl font-semibold mb-4">{isEditing() ? "Editar Medicamento" : "Agregar Medicamento"}</h2>
        <input type="text" placeholder="Código" class="border p-2 w-full mb-2"
          value={codigo()} onInput={(e) => setCodigo(e.currentTarget.value)} disabled={isEditing()} />
        <input type="text" placeholder="Nombre" class="border p-2 w-full mb-2"
          value={nombre()} onInput={(e) => setNombre(e.currentTarget.value)} />
        <input type="text" placeholder="Categoría" class="border p-2 w-full mb-2"
          value={categoria()} onInput={(e) => setCategoria(e.currentTarget.value)} />
        <input type="number" placeholder="Precio" class="border p-2 w-full mb-2"
          value={precio()} onInput={(e) => setPrecio(e.currentTarget.value)} />
        <input type="number" placeholder="Stock" class="border p-2 w-full mb-2"
          value={stock()} onInput={(e) => setStock(e.currentTarget.value)} />
        <input type="text" placeholder="Farmacéutica" class="border p-2 w-full mb-2"
          value={farmaceutica()} onInput={(e) => setFarmaceutica(e.currentTarget.value)} />
        <input type="number" placeholder="Unidades por Presentación" class="border p-2 w-full mb-2"
          value={unidadesPorPresentacion()} onInput={(e) => setUnidadesPorPresentacion(e.currentTarget.value)} />
        <input type="text" placeholder="Presentación" class="border p-2 w-full mb-2"
          value={presentacion()} onInput={(e) => setPresentacion(e.currentTarget.value)} />
        <input type="text" placeholder="Concentración" class="border p-2 w-full mb-2"
          value={concentracion()} onInput={(e) => setConcentracion(e.currentTarget.value)} />
        <input type="text" placeholder="Principio Activo" class="border p-2 w-full mb-2"
          value={principioActivo()} onInput={(e) => setPrincipioActivo(e.currentTarget.value)} />
        <input type="text" placeholder="Descripción" class="border p-2 w-full mb-2"
          value={descripcion()} onInput={(e) => setDescripcion(e.currentTarget.value)} />
        <label class="flex items-center mb-2">
          <input type="checkbox" class="mr-2" checked={requiereReceta()} onChange={(e) => setRequiereReceta(e.currentTarget.checked)} />
          Requiere Receta
        </label>
  
        {/* Sección para agregar imágenes con URLs */}
        <input type="text" placeholder="URL de la imagen" class="border p-2 w-full mb-2"
          value={fotoInput()} onInput={(e) => setFotoInput(e.currentTarget.value)} />
        <button class="bg-blue-500 text-white px-2 py-1 rounded w-full mb-2"
          onClick={() => {
            setFotos([...fotos(), fotoInput()]);
            setFotoInput("");
          }}>
          Agregar Imagen
        </button>
  
        {/* Vista previa de imágenes con opción de eliminar */}
        <div class="flex flex-wrap gap-2">
          <For each={fotos()}>
            {(foto, index) => (
              <div class="relative">
                <img src={foto} class="h-12 w-12 object-cover border rounded" />
                <button
                  class="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-full"
                  onClick={() => setFotos(fotos().filter((_, i) => i !== index()))}
                >✖</button>
              </div>
            )}
          </For>
        </div>
  
        <button class="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2"
          onClick={guardarMedicamento}>
          {isEditing() ? "Guardar Cambios" : "Agregar"}
        </button>
      </div>
  
      {/* Tarjetas de medicamentos con carrusel de imágenes */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={medicamentos()}>
          {(medicamento) => {
            const [currentImageIndex, setCurrentImageIndex] = createSignal(0);
  
            const nextImage = () => {
              setCurrentImageIndex((prev) =>
                prev === medicamento.fotos.length - 1 ? 0 : prev + 1
              );
            };
  
            const prevImage = () => {
              setCurrentImageIndex((prev) =>
                prev === 0 ? medicamento.fotos.length - 1 : prev - 1
              );
            };
  
            return (
              <div class="bg-white p-6 shadow-lg rounded-lg">
                <h3 class="text-xl font-semibold mb-2 text-gray-800">{medicamento.nombre}</h3>
                <p class="text-gray-600"><strong>Código:</strong> {medicamento.codigo}</p>
                <p class="text-gray-600"><strong>Categoría:</strong> {medicamento.categoria}</p>
                <p class="text-gray-600"><strong>Precio:</strong> ${medicamento.precio.toFixed(2)}</p>
                <p class="text-gray-600"><strong>Stock:</strong> {medicamento.stock}</p>
                <p class="text-gray-600"><strong>Farmacéutica:</strong> {medicamento.farmaceutica}</p>
                <p class="text-gray-600"><strong>Unidades por Presentación:</strong> {medicamento.unidadesPorPresentacion}</p>
                <p class="text-gray-600"><strong>Presentación:</strong> {medicamento.presentacion}</p>
                <p class="text-gray-600"><strong>Concentración:</strong> {medicamento.concentracion}</p>
                <p class="text-gray-600"><strong>Principio Activo:</strong> {medicamento.principioActivo}</p>
                <p class="text-gray-600"><strong>Descripción:</strong>{medicamento.descripcion}</p>
                <p class="text-gray-600"><strong>Requiere Receta:</strong> {medicamento.requiereReceta ? "Sí" : "No"}</p>
  
                {/* Carrusel de imágenes */}
                <div class="relative w-full h-48 mt-4">
                  {medicamento.fotos.length > 0 ? (
                    <>
                      <img
                        src={medicamento.fotos[currentImageIndex()]}
                        class="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                      {medicamento.fotos.length > 1 && (
                        <>
                          <button
                            class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg hover:bg-opacity-75 transition-all"
                            onClick={prevImage}
                          >❮</button>
                          <button
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg hover:bg-opacity-75 transition-all"
                            onClick={nextImage}
                          >❯</button>
                        </>
                      )}
                    </>
                  ) : (
                    <p class="text-gray-500">Sin imagen</p>
                  )}
                </div>
  
                <div class="mt-4 flex justify-between">
                  <button class="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => eliminarMedicamento(medicamento.codigo)}>
                    Eliminar
                  </button>
                  <button class="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => cargarDatosMedicamento(medicamento)}>
                    Editar
                  </button>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
  
}