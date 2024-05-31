const express = require("express");
const router = express();

const {
  obtenerEstadoMembresia,
  crearOrdenConMembresias,
  finalizarOrden,
  obtenerEstadoOrden,
  procesarPagoYActualizarMembresia,
} = require("../controllers/orders.controller");

router.post("/obtenerEstadoMembresia", obtenerEstadoMembresia);
router.post("/crearOrdenConMembresias", crearOrdenConMembresias);
router.post("/finalizarOrden", finalizarOrden);
router.post("/obtenerEstadoOrden", obtenerEstadoOrden);
router.post("/procesarPagoYActualizarMembresia", procesarPagoYActualizarMembresia);

module.exports = router;
