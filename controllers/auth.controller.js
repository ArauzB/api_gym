const { connection } = require("../services/bd");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { transporter } = require("../services/nodemailer.services");

const loginCliente = async (req, res) => {
  const { email, password } = req.body;
  const emailregex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (!email.trim().length || !password.trim().length) {
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
      `SELECT * FROM CLIENTES WHERE EMAIL = ?`,
      [email],
      async (error, results) => {
        if (error) {
          console.log(error);
        } else {
          if (results.length > 0) {
            const comparar = await bcryptjs.compare(
              password,
              results[0].PASSWORD
            );

            if (comparar) {
              const token = jwt.sign(
                {
                  id: results[0].ID,
                },
                process.env.SECRET,
                { expiresIn: 60 * 60 * 24 }
              );

              res.json({
                message: "Bienvenido al sistema",
                auth: true,
                id: results[0].ID,
                token: token,
              });
            } else {
              res.json({
                message: "Contraseña incorrecta",
                auth: false,
                token: null,
              });
            }
          } else {
            res.json({
              message: "El usuario no existe",
              auth: false,
              token: null,
            });
          }
        }
      }
    );
  }
};

const loginEmpleado = async (req, res) => {
  const { email, password } = req.body;
  const emailregex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (!email.trim().length || !password.trim().length) {
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
      `SELECT * FROM EMPLEADOS WHERE EMAIL = ?`,
      [email],
      async (error, results) => {
        if (error) {
          console.log(error);
        } else {
          if (results.length > 0) {
            const comparar = await bcryptjs.compare(
              password,
              results[0].PASSWORD
            );

            if (comparar) {
              const token = jwt.sign(
                {
                  id: results[0].ID,
                },
                process.env.SECRET,
                { expiresIn: 60 * 60 * 24 }
              );

              res.json({
                message: "Bienvenido al sistema",
                auth: true,
                id: results[0].ID,
                token: token,
              });
            } else {
              res.json({
                message: "Contraseña incorrecta",
                auth: false,
                token: null,
              });
            }
          } else {
            res.json({
              message: "El usuario no existe",
              auth: false,
              token: null,
            });
          }
        }
      }
    );
  }
};

const logout = (req, res) => {
  const { token } = req.body;
  const decoded = jwt.verify(token, process.env.SECRET);
  const fechaActual = new Date();
  const fechaYHoraActualString =
    fechaActual.toLocaleDateString() +
    " " +
    fechaActual.getHours() +
    ":" +
    fechaActual.getMinutes() +
    ":" +
    fechaActual.getSeconds();

  connection.query("UPDATE BITACORA SET ? WHERE fecha_hora_inicio = ?", [
    { fecha_hora_cierre: fechaYHoraActualString },
    decoded.fecha,
  ]);

  res.json({
    message: "Sesion cerrada",
    auth: false,
    token: null,
  });
};

const authMiddleware = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(401).json({
      message: "No hay token",
      auth: false,
      token: null,
    });
  }

  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: "Token inválido",
        auth: false,
        token: null,
      });
    }
  

    next();
  });
};

module.exports = {
  loginCliente,
  loginEmpleado,
  logout,
  authMiddleware,
};
