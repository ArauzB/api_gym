const { connection } = require("../services/bd");
const jwt = require("jsonwebtoken");


const obtenerEstadoMembresia = (req, res) => {
  const { token } = req.body;

  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: 'Token inválido',
        auth: false,
      });
    }

    const clienteId = decoded.id;

    connection.query(
      'SELECT MEMBRESIA_ID, FECHA_FIN FROM CLIENTE_MEMBRESIA WHERE CLIENTE_ID = ? AND FECHA_FIN > NOW()',
      [clienteId],
      (error, results) => {
        if (error) {
          return res.status(500).json({
            message: 'Error al obtener estado de la membresía',
            error,
          });
        }

        if (results.length > 0) {
          res.json({
            tieneMembresia: true,
            membresia: results[0],
          });
        } else {
          res.json({
            tieneMembresia: false,
          });
        }
      }
    );
  });
};
// Crear una nueva orden con membresías
const crearOrdenConMembresias = (req, res) => {
  const { token, membresiaId } = req.body;
  cantidad = 1;
  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: 'Token inválido',
        auth: false,
      });
    }

    const clienteId = decoded.id;

    connection.beginTransaction((err) => {
      if (err) {
        return res.status(500).json({
          message: 'Error al iniciar transacción',
          error: err,
        });
      }

      connection.query(
        'SELECT PRECIO FROM MEMBRESIAS WHERE ID = ?',
        [membresiaId],
        (error, results) => {
          if (error || results.length === 0) {
            return connection.rollback(() => {
              res.status(500).json({
                message: 'Error al obtener precio de la membresía',
                error: error || 'Membresía no encontrada',
              });
            });
          }

          const precioUnitario = results[0].PRECIO;
          const total = precioUnitario * cantidad;

          connection.query(
            'INSERT INTO ORDENES (CLIENTE_ID, FECHA, ESTADO_ORDEN_ID, TOTAL) VALUES (?, NOW(), ?, ?)',
            [clienteId, 1, total],
            (error, results) => {
              if (error) {
                return connection.rollback(() => {
                  res.status(500).json({
                    message: 'Error al crear la orden',
                    error,
                  });
                });
              }

              const orderId = results.insertId;

              connection.query(
                'INSERT INTO DETALLE_ORDEN (ORDEN_ID, MEMBRESIA_ID, CANTIDAD, PRECIO_UNITARIO) VALUES (?, ?, ?, ?)',
                [orderId, membresiaId, cantidad, precioUnitario],
                (error) => {
                  if (error) {
                    return connection.rollback(() => {
                      res.status(500).json({
                        message: 'Error al agregar detalle de la orden',
                        error,
                      });
                    });
                  }

                  connection.commit((err) => {
                    if (err) {
                      return connection.rollback(() => {
                        res.status(500).json({
                          message: 'Error al confirmar transacción',
                          error: err,
                        });
                      });
                    }

                    res.json({
                      message: 'Orden creada con éxito',
                      orderId: orderId,
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
};
// Finalizar la orden
const finalizarOrden = (req, res) => {
  const { token, orderId, tipoPagoId, detallesPago, estadoPago } = req.body; // estadoPago puede ser 2 (Pagado) o 3 (Cancelado)

  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: "Token inválido",
        auth: false,
      });
    }

    // Calcular el total de la orden
    connection.query(
      "SELECT SUM(CANTIDAD * PRECIO_UNITARIO) AS TOTAL FROM DETALLE_ORDEN WHERE ORDEN_ID = ?",
      [orderId],
      (error, results) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Error al calcular total", error });
        }

        const total = results[0].TOTAL;

        // Actualizar el total en la orden
        connection.query(
          "UPDATE ORDENES SET TOTAL = ?, ESTADO_ORDEN_ID = ? WHERE ID = ?",
          [total, estadoPago, orderId],
          (error, results) => {
            if (error) {
              return res
                .status(500)
                .json({ message: "Error al finalizar la orden", error });
            }

            // Insertar el pago
            connection.query(
              "INSERT INTO PAGOS (ORDEN_ID, TIPO_PAGO_ID, DETALLES, STATUS_PAGO, FECHA_PAGO) VALUES (?, ?, ?, ?, NOW())",
              [orderId, tipoPagoId, detallesPago, 1],
              (error, results) => {
                if (error) {
                  return res
                    .status(500)
                    .json({ message: "Error al registrar el pago", error });
                }
                res.json({ message: "Orden finalizada y pago registrado" });
              }
            );
          }
        );
      }
    );
  });
};

// Obtener estado de la orden
const obtenerEstadoOrden = (req, res) => {
  const { token } = req.body;

  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: 'Token inválido',
        auth: false,
      });
    }

    const clienteId = decoded.id;

    connection.query(
      'SELECT ESTADO_ORDEN_ID, ID FROM ORDENES WHERE CLIENTE_ID = ? AND ESTADO_ORDEN_ID = 1',
      [clienteId],
      (error, results) => {
        if (error) {
          return res.status(500).json({
            message: 'Error al obtener estado de la orden',
            error,
          });
        }

        if (results.length > 0) {
          const estadoOrdenId = results[0].ESTADO_ORDEN_ID;
          const id = results[0].ID;
          res.json({
            estadoOrdenId,
            id,
          });
        } else {
          res.json({
            message: 'No se encontraron órdenes para este cliente',
          });
        }
      }
    );
  });
};

// Procesar pago y actualizar membresía
const procesarPagoYActualizarMembresia = (req, res) => {
  const { orderId } = req.body;

  // Primero, actualizamos la membresía del cliente
  connection.query(
    `INSERT INTO CLIENTE_MEMBRESIA (CLIENTE_ID, MEMBRESIA_ID, FECHA_INICIO, FECHA_FIN) 
    SELECT CLIENTE_ID, MEMBRESIA_ID, CURDATE(), DATE_ADD(CURDATE(), INTERVAL MEMBRESIAS.DURACION_MESES MONTH)
    FROM ORDENES
    INNER JOIN DETALLE_ORDEN ON ORDENES.ID = DETALLE_ORDEN.ORDEN_ID
    INNER JOIN MEMBRESIAS ON DETALLE_ORDEN.MEMBRESIA_ID = MEMBRESIAS.ID
    WHERE ORDENES.ID = ?`,
    [orderId],
    (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Error al actualizar la membresía del cliente', error });
      }

      // Luego, actualizamos el estado de la orden a pagado (ID 2)
      connection.query(
        'UPDATE ORDENES SET ESTADO_ORDEN_ID = 2 WHERE ID = ?',
        [orderId],
        (error, results) => {
          if (error) {
            return res.status(500).json({ message: 'Error al actualizar el estado de la orden', error });
          }

          res.json({ message: 'Pago procesado con éxito y membresía actualizada' });
        }
      );
    }
  );
};


module.exports = {
  obtenerEstadoMembresia,
  crearOrdenConMembresias,
  finalizarOrden,
  obtenerEstadoOrden,
  procesarPagoYActualizarMembresia
};
