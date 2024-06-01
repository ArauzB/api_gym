const express = require("express");
const router = express();

const { asignarRutina, crearCita, getCita, getCitas} = require("../controllers/citas.controller");

router.post("/asignarRutina", asignarRutina);
router.post("/crearCita", crearCita);
router.post("/getCita", getCita);
router.get("/getCitas",getCitas);
module.exports = router;
