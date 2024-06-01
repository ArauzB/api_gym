const express = require("express");
const router = express();

const {
  createEmpleado,
  editEmpleado,
  getEmpleado,
  verificarCodigo
} = require("../controllers/empleado.controller");

router.post("/createEmpleado", createEmpleado);
router.post("/editEmpleado", editEmpleado);
router.post("/verificarCodigo", verificarCodigo);
router.post("/getEmpleado", getEmpleado);

module.exports = router;
