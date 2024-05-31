const express = require("express");
const router = express();
const jwt = require("jsonwebtoken");
const { connection } = require("../services/bd");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const {
  createProducto,
  editProducto,
  getsProductos,
  getProducto,
} = require("../controllers/productos.controller");

router.post("/createProducto", createProducto);
router.put("/editProducto", editProducto);
router.get("/getsProductos", getsProductos);
router.get("/getProducto/:id_producto", getProducto);
router.post("/updateImage", upload.single("imagen"), (req, res) => {
  const { id } = req.body;
  const fotoPath = req.file.path; // Ruta donde se guardó la imagen

  const fotoPath2 = "https://api-delivery-6h3j.onrender.com/" + fotoPath; // Ruta para guardar en la base de datos

  connection.query(
    "UPDATE PRODUCTOS SET FOTO = ? WHERE ID = ?",
    [fotoPath2, id],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.json({
          message: "Error al actualizar la imagen",
          auth: false,
          token: null,
        });
      }

      res.json({
        message: "Imagen actualizada correctamente",
        auth: true,
        token: null,
      });
    }
  );
});

module.exports = router;
