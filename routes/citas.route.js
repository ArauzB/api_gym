const express = require("express");
const router = express();

const { asignarRutina, crearCita, getCita} = require("../controllers/citas.controller");

router.post("/asignarRutina", asignarRutina);
router.post("/crearCita", crearCita);
router.post("/getCita", getCita);

module.exports = router;
