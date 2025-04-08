import emailjs from "emailjs-com";

// Configuración del servicio de farmacia para rechazos
const SERVICE_ID = "service_dgz538d"; // puedes cambiarlo si creás uno específico para farmacia
const TEMPLATE_ID_RECHAZO = "template_yjla3cv";
const PUBLIC_KEY = "vGiA54nbWcueOGTPb";

/**
 * Envía un correo de rechazo de moderación a través de EmailJS
 * @param email Correo del usuario que propuso el contenido
 * @param comentario Comentario del revisor explicando el motivo del rechazo
 * @param link Enlace al formulario para reenviar la propuesta corregida
 * @param pagina Nombre o título de la página que fue rechazada
 */
export const sendModeracionRechazoEmail = async (
  email: string,
  comentario: string,
  link: string,
  pagina: string
) => {
  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_RECHAZO,
      {
        email,       // {{email}} en la plantilla
        comentario,  // {{comentario}} en la plantilla
        link,        // {{link}} en la plantilla (botón de corrección)
        pagina,      // {{pagina}} en el subject y cuerpo
        reply_to: "soporte@farmacia.com",
      },
      PUBLIC_KEY
    );

    console.log("✅ Correo de rechazo enviado con éxito:", response);
    return { success: true };
  } catch (error) {
    console.error("❌ Error al enviar correo de rechazo:", error);
    return { success: false, error };
  }
};
