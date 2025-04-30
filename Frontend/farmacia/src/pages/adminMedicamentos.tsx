import { createSignal, createEffect, For } from "solid-js";
import { API_URL } from "../utils/api";

export default function AdminMedicamentos() {
  // Estado principal
  const [medicamentos, setMedicamentos] = createSignal<any[]>([]);
  const [error, setError] = createSignal<string>("");

  // Estados de formulario
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
  const [descripcion, setDescripcion] = createSignal("");
  const [requiereReceta, setRequiereReceta] = createSignal(false);

  // Imágenes
  const [fotos, setFotos] = createSignal<string[]>([]);
  const [fotoInput, setFotoInput] =createSignal("");

  // Edición
  const [isEditing, setIsEditing] = createSignal(false);

  // Referencia al input file para XML
  let fileInputEl: HTMLInputElement | undefined;

  // Carga inicial de medicamentos
  createEffect(async () => {
    try {
      const response = await fetch(`${API_URL}/medicamentos/listar`);
      if (!response.ok) throw new Error("Error obteniendo medicamentos");
      const data = await response.json();
      setMedicamentos(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los medicamentos");
    }
  });

  // Exportar catálogo a XML
  const exportarMedicamentos = () => {
    const xmlItems = medicamentos().map(med => `
      <medicamento>
        <codigo>${med.codigo}</codigo>
        <nombre>${med.nombre}</nombre>
        <categoria>${med.categoria}</categoria>
        <precio>${med.precio}</precio>
        <stock>${med.stock}</stock>
        <farmaceutica>${med.farmaceutica}</farmaceutica>
        <unidadesPorPresentacion>${med.unidadesPorPresentacion}</unidadesPorPresentacion>
        <presentacion>${med.presentacion}</presentacion>
        <concentracion>${med.concentracion}</concentracion>
        <principioActivo>${med.principioActivo}</principioActivo>
        <descripcion>${med.descripcion}</descripcion>
        <requiereReceta>${med.requiereReceta}</requiereReceta>
        ${med.fotos.map(f => `<foto>${f}</foto>`).join('')}
      </medicamento>`).join('');

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<medicamentos>${xmlItems}
</medicamentos>`;
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "medicamentos.xml";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importar catálogo desde XML
  const importarMedicamentos = async (e: Event) => {
    const files = (e.currentTarget as HTMLInputElement).files;
    if (!files || files.length === 0) return;
    try {
      const text = await files[0].text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "application/xml");
      const nodes = Array.from(xmlDoc.getElementsByTagName("medicamento"));
      const importedArray = nodes.map(node => {
        const get = (tag: string) => {
          const el = node.getElementsByTagName(tag)[0];
          return el ? el.textContent || "" : "";
        };
        return {
          codigo: get("codigo"),
          nombre: get("nombre"),
          categoria: get("categoria"),
          precio: parseFloat(get("precio") || "0"),
          stock: parseInt(get("stock") || "0"),
          farmaceutica: get("farmaceutica"),
          unidadesPorPresentacion: parseInt(get("unidadesPorPresentacion") || "0"),
          presentacion: get("presentacion"),
          concentracion: get("concentracion"),
          principioActivo: get("principioActivo"),
          descripcion: get("descripcion"),
          requiereReceta: get("requiereReceta") === "true",
          fotos: Array.from(node.getElementsByTagName("foto")).map(f => f.textContent || ""),
        };
      });
      const token = localStorage.getItem("token");
      for (const med of importedArray) {
        await fetch(
          `${API_URL}/medicamentos/${med.codigo ? med.codigo : 'crear'}`,
          {
            method: med.codigo ? 'PUT' : 'POST',
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(med),
          }
        );
      }
      setMedicamentos(importedArray);
    } catch (err) {
      console.error(err);
      setError("Error al importar medicamentos");
    }
  };

  // Función para crear o editar un medicamento
  const guardarMedicamento = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
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
      fotos: fotos(),
      descripcion: descripcion(),
      requiereReceta: requiereReceta(),
    };
    try {
      const res = await fetch(
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      if (isEditing()) {
        setMedicamentos(medicamentos().map(m => m.codigo === codigo() ? data : m));
      } else {
        setMedicamentos([...medicamentos(), data]);
      }
      // Limpiar formulario
      setCodigo(""); setNombre(""); setCategoria(""); setPrecio("");
      setStock(""); setFarmaceutica(""); setUnidadesPorPresentacion("");
      setPresentacion(""); setConcentracion(""); setPrincipioActivo("");
      setDescripcion(""); setRequiereReceta(false); setFotos([]); setFotoInput(""); setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(`No se pudo ${isEditing() ? "editar" : "agregar"} el medicamento.`);
    }
  };

  // Cargar datos para edición
  const cargarDatosMedicamento = (med: any) => {
    setCodigo(med.codigo);
    setNombre(med.nombre);
    setCategoria(med.categoria);
    setPrecio(med.precio.toString());
    setStock(med.stock.toString());
    setFarmaceutica(med.farmaceutica);
    setUnidadesPorPresentacion(med.unidadesPorPresentacion.toString());
    setPresentacion(med.presentacion);
    setConcentracion(med.concentracion);
    setPrincipioActivo(med.principioActivo);
    setDescripcion(med.descripcion);
    setRequiereReceta(med.requiereReceta);
    setFotos(med.fotos || []);
    setIsEditing(true);
  };

  // Eliminar medicamento
  const eliminarMedicamento = async (cod: string) => {
    try {
      const res = await fetch(`${API_URL}/medicamentos/${cod}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error();
      setMedicamentos(medicamentos().filter(m => m.codigo !== cod));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el medicamento.");
    }
  };

  return (
    <div class="p-8 bg-gray-100 min-h-screen">
      <h1 class="text-3xl font-bold mb-6 text-center">Gestión de Medicamentos</h1>
      {error() && <p class="text-red-600 mb-4">{error()}</p>}

      {/* Import / Export XML */}
      <div class="flex justify-center gap-4 mb-6">
        <button class="bg-green-600 text-white px-4 py-2 rounded" onClick={exportarMedicamentos}>
          Exportar XML
        </button>
        <button class="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => fileInputEl?.click()}>
          Importar XML
        </button>
        <input
          type="file"
          accept="application/xml"
          class="hidden"
          ref={el => (fileInputEl = el)}
          onChange={importarMedicamentos}
        />
      </div>

      {/* Formulario */}
      <div class="bg-white p-6 shadow-lg rounded-lg mb-8 max-w-md mx-auto">
        <h2 class="text-2xl font-semibold mb-4">{isEditing() ? "Editar Medicamento" : "Agregar Medicamento"}</h2>
        <input type="text" placeholder="Código" value={codigo()} onInput={e => setCodigo(e.currentTarget.value)} disabled={isEditing()} class="border p-2 w-full mb-2" />
        <input type="text" placeholder="Nombre" value={nombre()} onInput={e => setNombre(e.currentTarget.value)} class="border p-2 w-full mb-2" />
        <input type="text" placeholder="Categoría" value={categoria()} onInput={e => setCategoria(e.currentTarget.value)} class="border p-2 w-full mb-2" />
        <input type="number" placeholder="Precio" value={precio()} onInput={e => setPrecio(e.currentTarget.value)} class="border p-2 w-full mb-2" />
        <input type="number" placeholder="Stock" value={stock()} onInput={e => setStock(e.currentTarget.value)} class="border p-2 w-full mb-2" />
        <input type="text" placeholder="Farmacéutica" value={farmaceutica()} onInput={e => setFarmaceutica(e.currentTarget.value)} class="border p-2 w-full mb-2" />
        <input type="number" placeholder="Unidades por Presentación" value={unidadesPorPresentacion()} onInput={e => setUnidadesPorPresentacion(e.currentTarget.value)} class="border p-2 w-full mb-2" />
        <input type="text" placeholder="Presentación" value={presentacion()} onInput={e => setPresentacion(e.currentTarget.value)} class="border p-2 w-full mb-2" />
        <input type="text" placeholder="Concentración" value={concentracion()} onInput={e => setConcentracion(e.currentTarget.value)} class="border p-2 w-full mb-2" />
        <input type="text" placeholder="Principio Activo" value={principioActivo()} onInput={e => setPrincipioActivo(e.currentTarget.value)} class="border p-2 w-full mb-2" />
        <textarea placeholder="Descripción" value={descripcion()} onInput={e => setDescripcion(e.currentTarget.value)} class="border p-2 w-full mb-2" />
        <label class="flex items-center mb-4"><input type="checkbox" checked={requiereReceta()} onChange={e => setRequiereReceta(e.currentTarget.checked)} class="mr-2" />Requiere Receta</label>
        <input type="text" placeholder="URL de la imagen" value={fotoInput()} onInput={e => setFotoInput(e.currentTarget.value)} class="border p-2 w-full mb-2" />
        <button onClick={() => { setFotos([...fotos(), fotoInput()]); setFotoInput(""); }} class="bg-gray-800 text-white px-3 py-1 rounded w-full mb-4">Agregar Imagen</button>
        <div class="flex flex-wrap gap-2 mb-4">
          <For each={fotos()}>{(foto, i) => (
            <div class="relative">
              <img src={foto} alt="" class="h-12 w-12 object-cover border rounded" />
              <button onClick={() => setFotos(fotos().filter((_, idx) => idx !== i()))} class="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-full">✖</button>
            </div>
          )}</For>
        </div>
        <button onClick={guardarMedicamento} class="bg-blue-600 text-white px-4 py-2 rounded w-full">{isEditing() ? "Guardar Cambios" : "Agregar Medicamento"}</button>
      </div>

      {/* Listado de tarjetas */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={medicamentos()}>{med => {
          const [idx, setIdx] = createSignal(0);
          const next = () => setIdx(i => (i === med.fotos.length - 1 ? 0 : i + 1));
          const prev = () => setIdx(i => (i === 0 ? med.fotos.length - 1 : i - 1));
          return (
            <div class="bg-white p-6 shadow-lg rounded-lg">
              <h3 class="text-xl font-semibold mb-2 text-gray-800">{med.nombre}</h3>
              <p class="text-gray-600"><strong>Código:</strong> {med.codigo}</p>
              <p class="text-gray-600"><strong>Categoría:</strong> {med.categoria}</p>
              <p class="text-gray-600"><strong>Precio:</strong> ${med.precio.toFixed(2)}</p>
              <p class="text-gray-600"><strong>Stock:</strong> {med.stock}</p>
              <p class="text-gray-600"><strong>Farmacéutica:</strong> {med.farmaceutica}</p>
              <p class="text-gray-600"><strong>Unidades:</strong> {med.unidadesPorPresentacion}</p>
              <p class="text-gray-600"><strong>Presentación:</strong> {med.presentacion}</p>
              <p class="text-gray-600"><strong>Concentración:</strong> {med.concentracion}</p>
              <p class="text-gray-600"><strong>Principio Activo:</strong> {med.principioActivo}</p>
              <p class="text-gray-600"><strong>Descripción:</strong> {med.descripcion}</p>
              <p class="text-gray-600"><strong>Requiere Receta:</strong> {med.requiereReceta ? "Sí" : "No"}</p>
              <div class="relative w-full h-48 mt-4">
                {med.fotos.length > 0 ? (
                  <>
                    <img src={med.fotos[idx()]} alt="" class="w-full h-48 object-cover rounded-lg shadow-md" />
                    {med.fotos.length > 1 && (
                      <>
                        <button onClick={prev} class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">❮</button>
                        <button onClick={next} class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">❯</button>
                      </>
                    )}
                  </>
                ) : (
                  <p class="text-gray-500">Sin imagen</p>
                )}
              </div>
              <div class="mt-4 flex justify-between">
                <button onClick={() => eliminarMedicamento(med.codigo)} class="bg-red-600 text-white px-4 py-2 rounded">Eliminar</button>
                <button onClick={() => cargarDatosMedicamento(med)} class="bg-green-600 text-white px-4 py-2 rounded">Editar</button>
              </div>
            </div>
          );
        }}</For>
      </div>
    </div>
  );
}
