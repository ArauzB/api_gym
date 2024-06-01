const express = require("express");
const router = express();

const {
  createCliente,
  verificarCodigo,
  editCliente,
  getCliente,
} = require("../controllers/cliente.controller");

router.post("/createCliente", createCliente);
router.post("/editCliente", editCliente);
router.post("/getCliente", getCliente);
router.post("/verificarCodigo", verificarCodigo);

module.exports = router;
