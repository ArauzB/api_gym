const express = require("express");
const router = express();

const {
  createCliente,
  verificarCodigo,
  editCliente,
  getCliente,
  cliente
} = require("../controllers/cliente.controller");

router.post("/createCliente", createCliente);
router.post("/editCliente", editCliente);
router.post("/getCliente", getCliente);
router.post("/verificarCodigo", verificarCodigo);
router.get("/cliente",cliente)

module.exports = router;
