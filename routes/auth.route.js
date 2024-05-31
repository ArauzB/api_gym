const express = require("express");
const router = express();

const {
  loginCliente,
  loginEmpleado,
  logout,
  authMiddleware,
} = require("../controllers/auth.controller");

router.post("/loginCliente", loginCliente);
router.post("/loginEmpleado", loginEmpleado);
router.post("/logout", logout);
router.get("/verify", authMiddleware, (req, res) => {
  res.json({ message: "Ruta protegida accesible",
   });
});

module.exports = router;
