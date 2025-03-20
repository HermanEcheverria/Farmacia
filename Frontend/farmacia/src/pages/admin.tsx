import { createSignal, createEffect, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { sendEmail } from "../utils/email";
import { API_URL } from "../utils/api";

export default function AdminUsers() {
  const [users, setUsers] = createSignal([]);
  const [error, setError] = createSignal("");
  const [editUser, setEditUser] = createSignal(null);
  const [newEmail, setNewEmail] = createSignal("");
  const [newRole, setNewRole] = createSignal("");
  const [newActive, setNewActive] = createSignal(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  createEffect(async () => {
    try {
      const response = await fetch(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No autorizado");

      setUsers(data);
    } catch (err) {
      console.error("❌ Error en la solicitud:", err);
      setError("Acceso denegado. Solo administradores pueden ver esta página.");
      setTimeout(() => navigate("/"), 3000);
    }
  });

  const updateUser = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newEmail(),
          role: newRole(),
          active: newActive()
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Error al actualizar usuario");
      }

      const updatedUser = await response.json();

      if (newActive()) {
        await sendEmail(newEmail(), "activated", newRole());
      }

      setUsers(users().map((user) => (user._id === id ? updatedUser.user : user)));
      setEditUser(null);
    } catch (err) {
      console.error("Error actualizando usuario:", err);
      setError("No se pudo actualizar el usuario.");
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setNewEmail(user.email);
    setNewRole(user.role);
    setNewActive(user.active);
  };

  return (
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      {error() && <p class="text-red-600">{error()}</p>}
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2">Email</th>
            <th class="border p-2">Rol</th>
            <th class="border p-2">Estado</th>
            <th class="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <For each={users()}>
            {(user) => (
              <tr>
                <td class="border p-2">{user.email}</td>
                <td class="border p-2">{user.role}</td>
                <td class="border p-2">{user.active ? "Activo" : "Inactivo"}</td>
                <td class="border p-2">
                  <button 
                    class="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => openEditModal(user)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>

      {/* Modal para editar usuario */}
      <Show when={editUser()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div class="bg-white p-8 rounded shadow-md w-96">
            <h2 class="text-xl mb-4">Editar Usuario</h2>

            <label class="block mb-2">Correo Electrónico:</label>
            <input
              type="email"
              class="border p-2 mb-4 w-full"
              value={newEmail()}
              onInput={(e) => setNewEmail(e.currentTarget.value)}
            />

            <label class="block mb-2">Rol:</label>
            <select
              class="border p-2 mb-4 w-full"
              value={newRole()}
              onChange={(e) => setNewRole(e.currentTarget.value)}
            >
              <option value="admin">Admin</option>
              <option value="empleado">Empleado</option>
              <option value="paciente">Paciente</option>
              <option value="interconexiones">Interconexiones</option>
              <option value="sin-registrar">Sin Registrar</option>
            </select>

            <label class="block mb-2">Estado:</label>
            <div class="flex items-center mb-4">
              <input
                type="checkbox"
                checked={newActive()}
                onChange={(e) => setNewActive(e.currentTarget.checked)}
                class="mr-2"
              />
              <span>{newActive() ? "Activo" : "Inactivo"}</span>
            </div>

            <div class="flex justify-end space-x-2">
              <button
                class="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => updateUser(editUser()._id)}
              >
                Guardar
              </button>
              <button
                class="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => setEditUser(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
