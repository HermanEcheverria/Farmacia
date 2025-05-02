import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {API_URL} from "../utils/api";


export default function Login() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(""); // Limpiar errores previos
    const response = await fetch(`${API_URL}/auth/login` , {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email(), password: password() }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Error al iniciar sesión");
    } else {
      localStorage.setItem("token", data.token);
      
      navigate("/"); // Redirigir al home después del login
    }
  };

  return (
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 class="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
        {error() && <p class="text-red-600 text-sm text-center mb-4">{error()}</p>}
        <input 
          type="email" 
          placeholder="Correo Electrónico"
          class="w-full px-4 py-2 mb-4 border rounded"
          onInput={(e) => setEmail(e.currentTarget.value)}
        />
        <input 
          type="password" 
          placeholder="Contraseña"
          class="w-full px-4 py-2 mb-4 border rounded"
          onInput={(e) => setPassword(e.currentTarget.value)}
        />
        <button 
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          onClick={handleLogin}
        >
          Iniciar Sesión
        </button>
        <p class="text-sm text-center mt-4">
          ¿No tienes cuenta? 
          <a 
            href="/signup" 
            class="text-blue-600 hover:underline ml-1"
          >
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}
