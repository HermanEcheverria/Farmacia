const express = require('express');
const router = express.Router();
const Venta = require('../models/Venta');
const { verifyToken, verifyAdmin } = require('../utils/authMiddleware');

/**
 * Obtener las 10 categorías de medicamentos más vendidos con su total y porcentaje.
 * 
 * @name GET /dashboard/top-categories
 * @function
 * @memberof module:routes/dashboardRoutes
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @returns {void}
 */
router.get('/top-categories', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Desglosamos cada medicamento vendido y relacionamos con la colección "medicamentos" para obtener la categoría.
    const topCategories = await Venta.aggregate([
      { $unwind: "$medicamentos" },
      {
        $lookup: {
          from: "medicamentos",              
          localField: "medicamentos.medicamentoId",
          foreignField: "_id",
          as: "medData"
        }
      },
      { $unwind: "$medData" },
      {
        $group: {
          _id: "$medData.categoria",
          totalVentas: { $sum: "$medicamentos.cantidad" }
        }
      },
      { $sort: { totalVentas: -1 } },
      { $limit: 10 }
    ]);

    // Obtener el total de unidades vendidas en todas las ventas
    const overallSales = await Venta.aggregate([
      { $unwind: "$medicamentos" },
      {
        $group: {
          _id: null,
          total: { $sum: "$medicamentos.cantidad" }
        }
      }
    ]);
    const totalOverall = overallSales[0] ? overallSales[0].total : 0;

    // Calcular el porcentaje para cada categoría
    const categoriesWithPercentage = topCategories.map(cat => ({
      categoria: cat._id,
      totalVentas: cat.totalVentas,
      porcentaje: totalOverall > 0 ? ((cat.totalVentas / totalOverall) * 100).toFixed(2) : 0
    }));

    res.json({ categories: categoriesWithPercentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los datos del dashboard" });
  }
});

/**
 * Obtener la evolución de ventas mensuales sumando el monto total vendido por mes.
 * 
 * @name GET /dashboard/evolucion-ventas
 * @function
 * @memberof module:routes/dashboardRoutes
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @returns {void}
 */
router.get('/evolucion-ventas', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const ventasMensuales = await Venta.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$fechaVenta" } },
          totalVentas: { $sum: "$montoTotal" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ ventasMensuales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la evolución de ventas" });
  }
});

/**
 * Obtener los 10 medicamentos más vendidos (por nombre) con su cantidad total y porcentaje.
 * 
 * @name GET /dashboard/top-medicamentos
 * @function
 * @memberof module:routes/dashboardRoutes
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @returns {void}
 */
router.get('/top-medicamentos', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const topMedicamentos = await Venta.aggregate([
      { $unwind: "$medicamentos" },
      {
        $lookup: {
          from: "medicamentos",
          localField: "medicamentos.medicamentoId",
          foreignField: "_id",
          as: "medData"
        }
      },
      { $unwind: "$medData" },
      {
        $group: {
          _id: "$medData.nombre",
          totalVentas: { $sum: "$medicamentos.cantidad" }
        }
      },
      { $sort: { totalVentas: -1 } },
      { $limit: 10 }
    ]);
    
    // Calcular el total de unidades vendidas para obtener el porcentaje
    const overall = await Venta.aggregate([
      { $unwind: "$medicamentos" },
      { $group: { _id: null, total: { $sum: "$medicamentos.cantidad" } } }
    ]);
    const totalOverall = overall[0] ? overall[0].total : 0;
    const medicamentosWithPercentage = topMedicamentos.map(med => ({
      medicamento: med._id,
      totalVentas: med.totalVentas,
      porcentaje: totalOverall > 0 ? ((med.totalVentas / totalOverall) * 100).toFixed(2) : 0
    }));
    res.json({ medicamentos: medicamentosWithPercentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener top medicamentos" });
  }
});

module.exports = router;
