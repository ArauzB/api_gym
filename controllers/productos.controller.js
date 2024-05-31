const { connection } = require("../services/bd");
const jwt = require("jsonwebtoken");

const createProducto = async (req, res) => {
  const { nombre, descripcion, cantidad, precio, id_categoria } = req.body;

  if (!nombre.trim().length || !descripcion.trim().length) {
    res.json({
      message: "Faltan datos",
      auth: false,
      token: null,
    });
  } else {
    connection.query(
      "INSERT INTO MEMBRESIAS SET ?",
      {
        NOMBRE: nombre,
        DESCRIPCION: descripcion,
        CANTIDAD: cantidad,
        PRECIO: precio,
        ID_CATEGORIA: id_categoria,
      },
      async (error, results) => {
        if (error) {
          console.log(error);
        } else {
          res.json({
            message: "Se ha enviado un correo de confirmacion",
          });
        }
      }
    );
  }
};

const editProducto = async (req, res) => {
  const { nombre, descripcion, cantidad, precio, id_categoria } = req.body;
  const { id_producto } = req.params;

  if (!id_producto) {
    res.json({
      message: "Faltan datos",
    });
  }

  connection.query(
    `UPDATE MEMBRESIAS SET NOMBRE = ?, DESCRIPCION = ?, CANTIDAD = ?, PRECIO = ?, ID_CATEGORIA = ? WHERE ID = ?`,
    [nombre, descripcion, cantidad, precio, id_categoria, id_producto],
    (error, results) => {
      if (error) {
        console.log(error);
      } else {
        res.json({
          message: "Cliente actualizado",
        });
      }
    }
  );
};

const getsProductos = async (req, res) => {
  connection.query(`SELECT * FROM MEMBRESIAS`, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      res.json(results);
    }
  });
};

const getProducto = async (req, res) => {
  const { id_producto } = req.params;

  if (!id_producto) {
    res.json({
      message: "Faltan datos",
    });
  } else {
    connection.query(
      `SELECT * FROM MEMBRESIAS WHERE ID = ?`,
      [id_producto],
      (error, results) => {
        if (error) {
          console.log(error);
        } else {
          res.json(results);
        }
      }
    );
  }
};

module.exports = {
  createProducto,
  editProducto,
  getsProductos,
  getProducto,
};
