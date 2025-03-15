import emailjs from "emailjs-com";

const SERVICE_ID = "service_enz9wb6"; 
const TEMPLATE_ID_PENDING = "template_u6bxoda"; 
const TEMPLATE_ID_ACTIVATED = "template_fm4b8jk"; 
const USER_ID = "sDR8aGH496o2XqleM";

export const sendEmail = async (email: string, status: "pending" | "activated") => {
  const templateId = status === "pending" ? TEMPLATE_ID_PENDING : TEMPLATE_ID_ACTIVATED;

  try {
    const response = await emailjs.send(SERVICE_ID, templateId, {
      user_name: email,
      support_email: "soporte@farmacia.com",
    }, USER_ID);

    console.log(`✅ Correo de ${status} enviado con éxito:`, response);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error al enviar correo de ${status}:`, error);
    return { success: false, error };
  }
};
