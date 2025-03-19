const os = require("os");
const express = require("express");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const { verifyToken } = require("../utils/authMiddleware");
const Medicamento = require("../models/Medicamento");
const Venta = require("../models/Venta");

const router = express.Router();

// Obtener la IP del servidor para la API del hospital
const networkInterfaces = os.networkInterfaces();
let serverIp = "localhost";
for (const interfaceName in networkInterfaces) {
  for (const iface of networkInterfaces[interfaceName]) {
    if (!iface.internal && iface.family === "IPv4") {
      serverIp = iface.address;
      break;
    }
  }
}

// API del hospital
const HOSPITAL_API_URL = `http://${serverIp}:8080`;
console.log(`🔗 API del Hospital detectada en: ${HOSPITAL_API_URL}`);

/**
 * Endpoint para solicitar una receta.
 * Consulta el API del hospital y valida la disponibilidad de cada medicamento en la farmacia.
 * Se utiliza el campo "unidadesPorPresentacion" para mostrar la presentación registrada en Mongo.
 */
router.get("/solicitar/:codigo", verifyToken, async (req, res) => {
  try {
    const { codigo } = req.params;
    console.log(`🔍 Buscando receta con código: ${codigo}`);

    // Obtener el token del usuario autenticado
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "No autorizado. Inicia sesión nuevamente." });
    }

    // Consultar la receta en el sistema hospitalario (Oracle)
    const response = await axios.get(`${HOSPITAL_API_URL}/recetas/${codigo}`, {
      headers: { Authorization: token },
    });
    if (!response.data) {
      console.error("❌ Receta no encontrada en el sistema del hospital.");
      return res.status(404).json({ error: "Receta no encontrada" });
    }
    const receta = response.data;
    console.log("✅ Receta obtenida:", JSON.stringify(receta, null, 2));

    // Validar disponibilidad en la farmacia (MongoDB)
    const medicamentosDisponibles = [];
    let recetaCompleta = true;
    for (let item of receta.medicamentos) {
      // Extraer información del medicamento de la receta
      const medicamentoData = item.medicamento || {};
      if (!medicamentoData.idMedicamento) {
        console.warn(`⚠️ No se encontró información del medicamento en la receta: ${JSON.stringify(item, null, 2)}`);
        recetaCompleta = false;
        continue;
      }
      const idMedicamento = medicamentoData.idMedicamento;
      const principioActivo = medicamentoData.principioActivo || "Desconocido";
      const concentracion = medicamentoData.concentracion || "N/A";
      // Para la solicitud, se asume una cantidad base; el cálculo completo se hace en el endpoint de compra.
      const cantidad = parseInt(item.dosis) || 1;

      console.log(`🔍 Buscando medicamento en la farmacia: ${principioActivo} (ID: ${idMedicamento})`);

      // Buscar en la farmacia por ID
      const medicamento = await Medicamento.findOne({ idMedicamento });
      // Usar "unidadesPorPresentacion" del medicamento de Mongo (si existe) o valor alternativo del dato recibido
      const unidadesPorPresentacion = medicamento ? medicamento.unidadesPorPresentacion : (medicamentoData.unidadesPorPresentacion || 1);
      
      if (medicamento && medicamento.stock >= cantidad) {
        medicamentosDisponibles.push({
          idMedicamento,
          nombre: principioActivo,
          concentracion,
          presentacion: medicamento.presentacion, // Ej: "Caja"
          unidadesPorPresentacion,
          cantidad,
          disponible: true
        });
      } else {
        // Buscar alternativa con el mismo principio activo
        const alternativo = await Medicamento.findOne({
          principioActivo,
          stock: { $gte: cantidad }
        });
        if (alternativo) {
          console.log(`✅ Alternativa encontrada: ${alternativo.principioActivo} (${alternativo.codigo})`);
          medicamentosDisponibles.push({
            idMedicamento: alternativo.idMedicamento,
            nombre: alternativo.principioActivo,
            concentracion: alternativo.concentracion,
            presentacion: alternativo.presentacion,
            unidadesPorPresentacion: alternativo.unidadesPorPresentacion,
            cantidad,
            disponible: true
          });
        } else {
          console.warn(`⚠️ Medicamento agotado y sin alternativa: ${principioActivo}`);
          recetaCompleta = false;
          medicamentosDisponibles.push({
            idMedicamento,
            nombre: principioActivo,
            concentracion,
            presentacion: medicamentoData.presentacion || "N/A",
            unidadesPorPresentacion,
            cantidad,
            disponible: false
          });
        }
      }
    }

    if (!recetaCompleta) {
      return res.status(400).json({
        error: "No se puede completar la receta por falta de medicamentos",
        medicamentos: medicamentosDisponibles,
      });
    }

    return res.json({
      mensaje: "Receta disponible para compra",
      medicamentos: medicamentosDisponibles,
    });
  } catch (error) {
    console.error("❌ Error al procesar la solicitud de receta:", error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Error interno del servidor" });
  }
});

router.post("/comprar", verifyToken, async (req, res) => {
  try {
    const { codigo, tieneAprobacionSeguro } = req.body;
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "No autorizado. Inicia sesión nuevamente." });
    }

    // Obtener la receta desde el sistema hospitalario
    const response = await axios.get(`${HOSPITAL_API_URL}/recetas/${codigo}`, {
      headers: { Authorization: token },
    });
    if (!response.data) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }
    const receta = response.data;
    console.log("✅ Receta obtenida para compra:", JSON.stringify(receta, null, 2));

    let recetaCompleta = true;
    let medicamentosParaVenta = [];

    // Procesar cada medicamento realizando los cálculos completos
    for (let item of receta.medicamentos) {
      const medicamentoData = item.medicamento || {};
      if (!medicamentoData.idMedicamento) {
        recetaCompleta = false;
        continue;
      }
      const idMedicamento = medicamentoData.idMedicamento;
      const principioActivo = medicamentoData.principioActivo || "Desconocido";
      const concentracion = medicamentoData.concentracion || "N/A";

      // Campos de la receta: dosis, frecuencia y duracion (en meses)
      const dosis = parseFloat(item.dosis) || 1;         // Ej: 0.5 (media tableta)
      const frecuencia = parseInt(item.frecuencia) || 1;    // Ej: 1 dosis/día
      const duracionMeses = parseInt(item.duracion) || 1;   // Ej: 3 meses
      const dias = duracionMeses * 30;
      const cantidadRequerida = Math.ceil(dosis * frecuencia * dias);

      // Buscar medicamento en MongoDB
      let medicamento = await Medicamento.findOne({ idMedicamento });
      // Si se encuentra, usar "unidadesPorPresentacion" del documento; de lo contrario, tomar un valor por defecto
      let unidadesPorPresentacion = medicamento ? medicamento.unidadesPorPresentacion : (parseInt(medicamentoData.unidadesPorPresentacion) || 1);

      // Calcular el número de presentaciones (cajas) necesarias y la cantidad total a vender
      const cajasNecesarias = Math.ceil(cantidadRequerida / unidadesPorPresentacion);
      const cantidadAVender = cajasNecesarias * unidadesPorPresentacion;
      
      console.log(`🔍 Procesando medicamento: ${principioActivo} (ID: ${idMedicamento}) - Requerido: ${cantidadRequerida}, Unidades por Presentación: ${unidadesPorPresentacion}, Cajas: ${cajasNecesarias}`);

      if (medicamento && medicamento.stock >= cantidadAVender) {
        medicamentosParaVenta.push({
          idMedicamento,
          nombre: principioActivo,
          concentracion,
          presentacion: medicamento.presentacion, // Ej: "Caja"
          unidadesPorPresentacion,
          cantidadAVender,
          precioUnitario: medicamento.precio,
          medicamentoDoc: medicamento,
        });
      } else {
        // Buscar alternativa con el mismo principio activo
        const alternativo = await Medicamento.findOne({
          principioActivo,
          stock: { $gte: cantidadAVender }
        });
        if (alternativo) {
          unidadesPorPresentacion = alternativo.unidadesPorPresentacion;
          console.log(`✅ Alternativa encontrada: ${alternativo.principioActivo} (${alternativo.codigo})`);
          medicamentosParaVenta.push({
            idMedicamento: alternativo.idMedicamento,
            nombre: alternativo.principioActivo,
            concentracion: alternativo.concentracion,
            presentacion: alternativo.presentacion,
            unidadesPorPresentacion,
            cantidadAVender,
            precioUnitario: alternativo.precio,
            medicamentoDoc: alternativo,
          });
        } else {
          console.warn(`⚠️ Medicamento agotado y sin alternativa: ${principioActivo}`);
          recetaCompleta = false;
          break;
        }
      }
    }

    if (!recetaCompleta) {
      return res.status(400).json({
        error: "No se puede completar la receta por falta de medicamentos",
        medicamentos: medicamentosParaVenta,
      });
    }

    // Calcular totales de la compra
    let total = 0;
    medicamentosParaVenta.forEach(item => {
      total += item.cantidadAVender * item.precioUnitario;
    });
    let descuento = 0;
    if (tieneAprobacionSeguro) {
      descuento = total * 0.20; // Descuento del 20% si la receta cuenta con aprobación del seguro
    }
    const totalFinal = total - descuento;

    // Actualizar el inventario: descontar la cantidad vendida
    for (let item of medicamentosParaVenta) {
      await Medicamento.updateOne(
        { idMedicamento: item.idMedicamento },
        { $inc: { stock: -item.cantidadAVender } }
      );
    }
    // Registrar la venta en la colección "ventas"
    const venta = new Venta({
      medicamentos: medicamentosParaVenta.map(item => ({
        medicamentoId: item.medicamentoDoc._id, 
        cantidad: item.cantidadAVender,
        precioUnitario: item.precioUnitario
      })),
      montoTotal: total,
      usuario: req.user._id
    });
    await venta.save();
    console.log("✅ Venta registrada en la colección ventas:", venta);

// Generar factura PDF utilizando pdfkit
const doc = new PDFDocument({ size: "A4", margin: 50 });
let buffers = [];

// Acumular los datos en 'buffers' para luego convertirlos a base64
doc.on("data", buffers.push.bind(buffers));
doc.on("end", () => {
  const pdfData = Buffer.concat(buffers).toString("base64");
  return res.json({
    mensaje: "Compra procesada exitosamente",
    total,
    descuento,
    totalFinal,
    pdfFactura: pdfData,
  });
});

// --- ENCABEZADO ---
doc
  .fontSize(18)
  .text("Factura de Compra", { align: "center" })
  .moveDown();

// Línea horizontal
doc
  .strokeColor("#aaaaaa")
  .lineWidth(1)
  .moveTo(doc.x, doc.y)
  .lineTo(doc.page.width - doc.options.margin, doc.y)
  .stroke();

doc.moveDown(0.5);

// Información de la Receta
doc
  .fontSize(12)
  .text(`Código de Receta: ${codigo}`, { align: "left" })
  .text(`Fecha: ${new Date().toLocaleString()}`)
  .moveDown();

// --- DETALLE DE MEDICAMENTOS ---
doc.fontSize(14).text("Detalle de Medicamentos:", { underline: true });
doc.moveDown(0.5);

// Encabezado de la tabla (cuatro columnas: Medicamento, Cantidad, Precio Unit., Subtotal)
doc.fontSize(12);
const tableTop = doc.y; // posición Y inicial de la tabla

doc.text("Medicamento", 50, tableTop);
doc.text("Cantidad", 250, tableTop);
doc.text("Precio Unit.", 350, tableTop);
doc.text("Subtotal", 450, tableTop);

doc.moveDown(0.5);

// Línea horizontal debajo de los encabezados
doc
  .strokeColor("#cccccc")
  .lineWidth(1)
  .moveTo(50, doc.y)
  .lineTo(doc.page.width - 50, doc.y)
  .stroke();

// Listar cada medicamento en filas
medicamentosParaVenta.forEach((item) => {
  const y = doc.y + 5; // Pequeño margen vertical
  const subtotal = item.cantidadAVender * item.precioUnitario;

  doc.text(item.nombre, 50, y);
  doc.text(item.cantidadAVender.toString(), 250, y);
  doc.text(`$${item.precioUnitario}`, 350, y);
  doc.text(`$${subtotal}`, 450, y);

  doc.moveDown(); // siguiente fila
});

// Línea horizontal final
doc
  .moveDown(0.5)
  .strokeColor("#cccccc")
  .lineWidth(1)
  .moveTo(50, doc.y)
  .lineTo(doc.page.width - 50, doc.y)
  .stroke();

doc.moveDown(1);

// --- TOTALES ---
doc.fontSize(12);
doc.text(`Total: $${total}`);
doc.text(`Descuento: $${descuento}`);
doc.text(`Total Final: $${totalFinal}`, { underline: true });

// Finaliza y genera el PDF
doc.end();


  } catch (error) {
    console.error("❌ Error en proceso de compra:", error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Error interno en el proceso de compra" });
  }
});

module.exports = router;
