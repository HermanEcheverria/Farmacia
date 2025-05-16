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
      setTimeout(() => navigate("/"), 4001);
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
    <div class="p-8 bg-[#E9F8FB] min-h-screen">
      <h1 class="text-3xl font-bold text-[#024059] mb-6 text-center">Gestión de Usuarios</h1>

      {error() && <p class="text-red-600 text-center">{error()}</p>}

      <table class="w-full border border-[#A1C7E0] rounded-xl overflow-hidden shadow-md bg-white">
        <thead class="bg-[#A1C7E0] text-[#024059]">
          <tr>
            <th class="border border-[#A1C7E0] p-3">Email</th>
            <th class="border border-[#A1C7E0] p-3">Rol</th>
            <th class="border border-[#A1C7E0] p-3">Estado</th>
            <th class="border border-[#A1C7E0] p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <For each={users()}>
            {(user) => (
              <tr class="hover:bg-[#F0FAFC]">
                <td class="border border-[#A1C7E0] p-3">{user.email}</td>
                <td class="border border-[#A1C7E0] p-3">{user.role}</td>
                <td class="border border-[#A1C7E0] p-3">
                  {user.active ? "✅ Activo" : "❌ Inactivo"}
                </td>
                <td class="border border-[#A1C7E0] p-3">
                  <button
                    class="bg-[#0099DD] hover:bg-[#007cb2] text-white px-3 py-1 rounded font-medium transition"
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
        <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-xl w-96 border border-[#00ABBD] shadow-xl">
            <h2 class="text-2xl text-[#024059] font-semibold mb-4 text-center">Editar Usuario</h2>

            <label class="block text-sm text-[#026E81] mb-1">Correo Electrónico:</label>
            <input
              type="email"
              class="w-full p-2 border border-[#026E81] rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#00ABBD]"
              value={newEmail()}
              onInput={(e) => setNewEmail(e.currentTarget.value)}
            />

            <label class="block text-sm text-[#026E81] mb-1">Rol:</label>
            <select
              class="w-full p-2 border border-[#026E81] rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#00ABBD]"
              value={newRole()}
              onChange={(e) => setNewRole(e.currentTarget.value)}
            >
              <option value="admin">Admin</option>
              <option value="empleado">Empleado</option>
              <option value="paciente">Paciente</option>
              <option value="interconexiones">Interconexiones</option>
              <option value="sin-registrar">Sin Registrar</option>
            </select>

            <label class="block text-sm text-[#026E81] mb-1">Estado:</label>
            <div class="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                checked={newActive()}
                onChange={(e) => setNewActive(e.currentTarget.checked)}
                class="accent-[#04BF8A]"
              />
              <span>{newActive() ? "✅ Activo" : "❌ Inactivo"}</span>
            </div>

            <div class="flex justify-end gap-2">
              <button
                class="bg-[#04BF8A] hover:bg-[#03a577] text-white px-4 py-2 rounded font-medium transition"
                onClick={() => updateUser(editUser()._id)}
              >
                Guardar
              </button>
              <button
                class="bg-[#FF9933] hover:bg-[#e68500] text-white px-4 py-2 rounded font-medium transition"
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
