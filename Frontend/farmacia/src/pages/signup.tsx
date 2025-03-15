import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { sendEmail } from "../utils/email";

export default function Signup() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError(""); 
    setSuccess(""); 

    const response = await fetch("http://localhost:5000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email(), password: password() }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Error al registrarse");
    } else {
      setSuccess("Cuenta creada con éxito. Verifica tu correo para activarla.");

      // ✅ Enviar email de activación
      const emailResponse = await sendEmail(email(), "pending");
      if (!emailResponse.success) {
        setError("Error al enviar correo de activación");
      }

      setTimeout(() => navigate("/login"), 4000);
    }
  };

  return (
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 class="text-2xl font-bold text-center mb-6">Registrarse</h2>
        {error() && <p class="text-red-600 text-sm text-center mb-4">{error()}</p>}
        {success() && <p class="text-green-600 text-sm text-center mb-4">{success()}</p>}
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
          class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          onClick={handleSignup}
        >
          Registrarse
        </button>
      </div>
    </div>
  );
}
