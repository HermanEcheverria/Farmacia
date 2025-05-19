// farmacia-frontend/src/components/ServicioAdmin.tsx
import { createSignal, onMount, For } from 'solid-js';
import {
  fetchServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio
} from '../utils/api';

type Servicio = {
  _id: string;
  nombre: string;
  baseUrl: string;
  tipo: 'HOSPITAL' | 'ASEGURADORA';
  activo: boolean;
};

export default function ServicioAdmin() {
  const [servicios, setServicios] = createSignal<Servicio[]>([]);
  const [nombre, setNombre] = createSignal('');
  const [baseUrl, setBaseUrl] = createSignal('');
  const [tipo, setTipo] = createSignal<'HOSPITAL' | 'ASEGURADORA'>('HOSPITAL');
  const [activo, setActivo] = createSignal<boolean>(true);
  const [error, setError] = createSignal<string>('');
  const [editId, setEditId] = createSignal<string | null>(null);

  const token = localStorage.getItem('token') || '';

  const loadServicios = async () => {
    try {
      const data = await fetchServicios(token);
      setServicios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar servicios');
    }
  };

  onMount(loadServicios);

  const resetForm = () => {
    setNombre('');
    setBaseUrl('');
    setTipo('HOSPITAL');
    setActivo(true);
    setEditId(null);
    setError('');
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    try {
      if (editId()) {
        await actualizarServicio(
          editId()!,
          { nombre: nombre(), baseUrl: baseUrl(), tipo: tipo(), activo: activo() } as any,
          token
        );
      } else {
        await crearServicio({ nombre: nombre(), baseUrl: baseUrl(), tipo: tipo() }, token);
      }
      await loadServicios();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al guardar servicio');
    }
  };

  const handleEdit = (s: Servicio) => {
    setEditId(s._id);
    setNombre(s.nombre);
    setBaseUrl(s.baseUrl);
    setTipo(s.tipo);
    setActivo(s.activo);
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este servicio?')) return;
    setError('');
    try {
      await eliminarServicio(id, token);
      await loadServicios();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar servicio');
    }
  };

  return (
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8 text-center">Administración de Servicios</h1>

      {/* Formulario en tarjeta */}
      <section class="bg-white shadow-lg rounded-lg p-6 mb-10">
        <h2 class="text-xl font-semibold mb-4">
          {editId() ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
        </h2>
        {error() && (
          <div class="bg-red-100 text-red-700 p-3 rounded mb-4">{error()}</div>
        )}
        <form onSubmit={handleSubmit} class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label class="mb-1 font-medium">Tipo</label>
            <select
              value={tipo()}
              onChange={e => setTipo((e.currentTarget as HTMLSelectElement).value as any)}
              class="border border-gray-300 p-2 rounded"
            >
              <option value="HOSPITAL">Hospital</option>
              <option value="ASEGURADORA">Aseguradora</option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="mb-1 font-medium">Nombre</label>
            <input
              type="text"
              value={nombre()}
              onInput={e => setNombre((e.currentTarget as HTMLInputElement).value)}
              class="border border-gray-300 p-2 rounded w-full"
              placeholder="Nombre del servicio"
              required
            />
          </div>

          <div class="flex flex-col md:col-span-2">
            <label class="mb-1 font-medium">Base URL</label>
            <input
              type="url"
              value={baseUrl()}
              onInput={e => setBaseUrl((e.currentTarget as HTMLInputElement).value)}
              class="border border-gray-300 p-2 rounded w-full"
              placeholder="https://api.ejemplo.com"
              required
            />
          </div>

          {editId() && (
            <div class="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={activo()}
                onChange={e => setActivo((e.currentTarget as HTMLInputElement).checked)}
                class="h-4 w-4"
              />
              <label class="font-medium">Activo</label>
            </div>
          )}

          <div class="md:col-span-2 flex justify-end space-x-3 mt-4">
            {editId() && (
              <button
                type="button"
                onClick={resetForm}
                class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editId() ? 'Guardar Cambios' : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </section>

      {/* Tabla de servicios */}
      <section class="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base URL</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <For each={servicios()}>
              {s => (
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.tipo}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.nombre}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600 break-all">{s.baseUrl}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.activo ? 'Activo' : 'Inactivo'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <button
                      onClick={() => handleEdit(s)}
                      class="text-indigo-600 hover:text-indigo-800 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      class="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </section>
    </div>
  );
}
