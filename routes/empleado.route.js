const express = require("express");
const router = express();

const {
  createEmpleado,
  editEmpleado,
  getEmpleado,
} = require("../controllers/empleado.controller");

router.post("/createEmpleado", createEmpleado);
router.post("/editEmpleado", editEmpleado);
router.get("/getEmpleado", getEmpleado);

module.exports = router;
