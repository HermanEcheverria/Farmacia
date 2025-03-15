import emailjs from "emailjs-com";

const SERVICE_ID = "service_enz9wb6"; 
const TEMPLATE_ID_PENDING = "template_u6bxoda"; 
const TEMPLATE_ID_ACTIVATED = "template_fm4b8jk"; 
const USER_ID = "sDR8aGH496o2XqleM";

export const sendEmail = async (email: string, status: "pending" | "activated", role?: string) => {
  const templateId = status === "pending" ? TEMPLATE_ID_PENDING : TEMPLATE_ID_ACTIVATED;

  try {
    console.log(`📧 Enviando correo de ${status} a: ${email} con rol: ${role}`);

    const response = await emailjs.send(SERVICE_ID, templateId, {
      user_email: email, 
      user_role: role || "No asignado",
      support_email: "soporte@farmacia.com",
    }, USER_ID);

    console.log(`✅ Correo de ${status} enviado con éxito a ${email}`, response);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error al enviar correo de ${status} a ${email}:`, error);
    return { success: false, error };
  }
};
