const { connection } = require("../services/bd");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { transporter } = require("../services/nodemailer.services");
require('dotenv').config()

const createCliente = async (req, res) => {
  const { nombre, telefono, email, password } = req.body;

  let passwordHash = await bcryptjs.hash(password, 10);

  const emailregex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const passregex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

  const codigo = Math.round(Math.random() * 999999);

  if (
    !nombre.trim().length ||
    !email.trim().length ||
    !password.trim().length
  ) {
    res.json({
      message: "Faltan datos",
      auth: false,
      token: null,
    });
  } else if (!emailregex.test(email)) {
    res.json({
      message: "El correo electronico no es valido",
      auth: false,
      token: null,
    });
  } else {
    connection.query(
      "SELECT * FROM CLIENTES WHERE EMAIL = ?",
      [email],
      async (error, results) => {
        if (error) {
          console.log(error);
        } else {
          if (results.length > 0) {
            res.json({
              message: "Este usuario ya esta registrado",
              auth: false,
              token: null,
            });
          } else if (!passregex.test(password)) {
            res.json({
              message: "La contraseña no es valida",
              auth: false,
              token: null,
            });
          } else {
            connection.query(
              "INSERT INTO CLIENTES SET ?",
              {
                NOMBRE: nombre,
                TELEFONO: telefono,
                EMAIL: email,
                PASSWORD: passwordHash,
                ESTADO: codigo,
              },
              async (error, results) => {
                if (error) {
                  console.log(error);
                } else {
                  try {
                    const mail = await transporter.sendMail({
                      from: process.env.EMAIL,
                      to: email,
                      subject: "Gracias por su registro",
                      html: `<h1>Bienvenid@ ${nombre}</h1>
                     <p>Tu codigo de verificacion es: ${codigo}</p>`,
                    });
                    console.log("Email enviado");
                  } catch (error) {
                    console.log(error);
                  }
                  res.json({
                    message: "Se ha enviado un correo de confirmacion",
                    auth: true,
                   
                  });
                }
              }
            );
          }
        }
      }
    );
  }
};

const editCliente = async (req, res) => {
  const { token, nombre, apellido, telefono } = req.body;

  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: "Token inválido",
        auth: false,
        token: null,
      });
    }

    id_cliente = decoded.id;

    connection.query(
      `UPDATE CLIENTES SET NOMBRE = ?, APELLIDO = ?, TELEFONO = ? WHERE ID = ?`,
      [nombre, apellido, telefono, id_cliente],
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
  });
};

const getCliente = async (req, res) => {
  const { token } = req.body;

  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: "Token inválido",
        auth: false,
        token: null,
      });
    }

    id_usuario = decoded.id;

    connection.query(
      `SELECT * FROM CLIENTES WHERE ID = ?`,
      [id_usuario],
      (error, results) => {
        if (error) {
          console.log(error);
        } else {
          res.json(results);
        }
      }
    );
  });
};

const verificarCodigo = async (req, res) => {
  const { token, codigo } = req.body;

  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: "Token inválido",
        auth: false,
        token: null,
      });
    }

    id_usuario = decoded.id;

    console.log(id_usuario);

    connection.query(
      `SELECT ESTADO FROM CLIENTES WHERE ID = ?`,
      [id_usuario],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            message: "Error en el servidor",
          });
        } else if (results.length === 0) {
          return res.status(404).json({
            message: "Usuario no encontrado",
          });
        } else {
          const codigoClave = results[0].ESTADO;
          if (codigoClave === codigo) {
            connection.query(
              `UPDATE CLIENTES SET ESTADO = NULL WHERE ID = ?`,
              [id_usuario],
              (error, results) => {
                if (error) {
                  console.log(error);
                  return res.status(500).json({
                    message: "Error en el servidor",
                  });
                } else {
                  res.json({
                    message: "Código verificado con éxito",
                    verified: true,
                  });
                }
              }
            );
          } else {
            res.json({
              message: "Código incorrecto",
              verified: false,
            });
          }
        }
      }
    );
  });
};


module.exports = {
  createCliente,
  editCliente,
  getCliente,
  verificarCodigo
};
