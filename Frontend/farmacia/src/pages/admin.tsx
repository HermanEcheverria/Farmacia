import { createSignal, createEffect, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { sendEmail } from "../utils/email";
import API_URL from "../utils/api";

export default function AdminUsers() {
  const [users, setUsers] = createSignal([]);
  const [error, setError] = createSignal("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  createEffect(async () => {
    try {
      const response = await fetch(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("No autorizado");
      setUsers(await response.json());
    } catch (err) {
      setError("Acceso denegado. Solo administradores pueden ver esta página.");
      setTimeout(() => navigate("/"), 3000);
    }
  });

  const updateUser = async (id: string, active: boolean, role: string, email: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active, role }),
      });

      if (!response.ok) throw new Error("Error al actualizar usuario");
      const updatedUser = await response.json();

      // ✅ Enviar email de activación con el rol si la cuenta fue activada
      if (active) {
        await sendEmail(email, "activated", role);  // ✅ Ahora enviamos el rol
      }

      // ✅ Actualizar el estado de la lista de usuarios
      setUsers(users().map((user) => (user._id === id ? updatedUser.user : user)));
    } catch (err) {
      console.error("Error actualizando usuario:", err);
      setError("No se pudo actualizar el usuario.");
    }
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
                <td class="border p-2">
                  <select
                    class="border p-1"
                    value={user.role}
                    onChange={(e) => updateUser(user._id, user.active, e.currentTarget.value, user.email)}
                  >
                    <option value="admin">Admin</option>
                    <option value="empleado">Empleado</option>
                    <option value="paciente">Paciente</option>
                    <option value="interconexiones">Interconexiones</option>
                  </select>
                </td>
                <td class="border p-2">
                  <button
                    class={`px-2 py-1 rounded ${user.active ? "bg-green-500" : "bg-gray-400"} text-white`}
                    onClick={() => updateUser(user._id, !user.active, user.role, user.email)}
                  >
                    {user.active ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td class="border p-2">
                  <button class="bg-blue-500 text-white px-2 py-1 rounded">Editar</button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
