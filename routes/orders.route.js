const express = require("express");
const router = express();

const {
  crearOrdenConMembresias,
  finalizarOrden,
} = require("../controllers/orders.controller");

router.post("/crearOrdenConMembresias", crearOrdenConMembresias);
router.post("/finalizarOrden", finalizarOrden);

module.exports = router;
