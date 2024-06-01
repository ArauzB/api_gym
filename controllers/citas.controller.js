const { connection } = require("../services/bd");
const jwt = require("jsonwebtoken");
require('dotenv').config()

const asignarRutina = (req, res) => {
  const { token, clienteId, rutinaId } = req.body;

  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: "Token inválido",
        auth: false,
      });
    }

    const fechaAsignacion = new Date();

    connection.query(
      "INSERT INTO RUTINA_CLIENTE (CLIENTE_ID, RUTINA_ID, FECHA_ASIGNACION) VALUES (?, ?, ?)",
      [clienteId, rutinaId, fechaAsignacion],
      (error, results) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Error al asignar rutina", error });
        }
        res.json({ message: "Rutina asignada con éxito" });
      }
    );
  });
};

const crearCita = (req, res) => {
  const {
    token,
    clienteId,
    fecha,
    hora,
    duracionMinutos,
    tipoCita,
  } = req.body;

  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: "Token inválido",
        auth: false,
      });
    }

    const instructorId = decoded.id;

    connection.query(
      "INSERT INTO CITAS (CLIENTE_ID, INSTRUCTOR_ID, FECHA, HORA, DURACION_MINUTOS, TIPO_CITA) VALUES (?, ?, ?, ?, ?, ?)",
      [clienteId, instructorId, fecha, hora, duracionMinutos, tipoCita],
      (error, results) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Error al crear cita", error });
        }
        res.json({ message: "Cita creada con éxito" });
      }
    );
  });
};

const getCita = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.json({
      message: "Faltan datos",
    });
  } else {
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
        `SELECT 
        c.ID AS CITA_ID,
        cl.NOMBRE AS CLIENTE_NOMBRE,
        e.NOMBRE AS INSTRUCTOR_NOMBRE,
        e.APELLIDO AS INSTRUCTOR_APELLIDO,
        c.FECHA,
        c.HORA,
        c.DURACION_MINUTOS,
        c.TIPO_CITA
    FROM 
        CITAS c
    JOIN 
        CLIENTES cl ON c.CLIENTE_ID = cl.ID
    JOIN 
        EMPLEADOS e ON c.INSTRUCTOR_ID = e.ID
    WHERE 
        c.CLIENTE_ID = ?
    `,
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
  }
};


const getCitas = async (req, res) => {

      connection.query(
        `SELECT 
        c.ID AS CITA_ID,
        cl.NOMBRE AS CLIENTE_NOMBRE,
        e.NOMBRE AS INSTRUCTOR_NOMBRE,
        e.APELLIDO AS INSTRUCTOR_APELLIDO,
        c.FECHA,
        c.HORA,
        c.DURACION_MINUTOS,
        c.TIPO_CITA
    FROM 
        CITAS c
    JOIN 
        CLIENTES cl ON c.CLIENTE_ID = cl.ID
    JOIN 
        EMPLEADOS e ON c.INSTRUCTOR_ID = e.ID
    `,
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            res.json(results);
          }
        }
      );
    }


module.exports = {
  asignarRutina,
  crearCita,
  getCita,
  getCitas
};
