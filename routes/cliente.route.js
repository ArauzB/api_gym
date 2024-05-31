const express = require("express");
const router = express();

const {
  createCliente,
  editCliente,
  getCliente,
} = require("../controllers/cliente.controller");

router.post("/createCliente", createCliente);
router.post("/editCliente", editCliente);
router.post("/getCliente", getCliente);

module.exports = router;
