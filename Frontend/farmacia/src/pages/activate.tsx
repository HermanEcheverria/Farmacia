import { useParams } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import { sendEmail } from "../utils/email";

export default function Activate() {
  const params = useParams();
  const [message, setMessage] = createSignal("");

  createEffect(async () => {
    const response = await fetch(`http://localhost:5000/auth/activate/${params.email}`, { method: "POST" });
    const data = await response.json();

    if (response.ok) {
      setMessage("Cuenta activada con éxito.");
      await sendEmail(params.email, "activated"); // ✅ Enviar correo de confirmación
    } else {
      setMessage(data.error || "Error al activar la cuenta.");
    }
  });

  return <div class="text-center">{message()}</div>;
}
