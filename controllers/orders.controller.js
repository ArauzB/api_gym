const { connection } = require("../services/bd");
const jwt = require("jsonwebtoken");

// Crear una nueva orden con membresías
const crearOrdenConMembresias = (req, res) => {
  const { token, membresias } = req.body; // { membresiaId: 1, cantidad: 2 }

  jwt.verify(token, process.env.SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: "Token inválido",
        auth: false,
      });
    }

    const clienteId = decoded.id;

    connection.beginTransaction((err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error al iniciar transacción", error: err });
      }

      connection.query(
        "INSERT INTO ORDENES (CLIENTE_ID, FECHA, ESTADO_ORDEN_ID, TOTAL) VALUES (?, NOW(), ?, ?)",
        [clienteId, 1, 0.0],
        (error, results) => {
          if (error) {
            return connection.rollback(() => {
              res
                .status(500)
                .json({ message: "Error al crear la orden", error });
            });
          }

          const orderId = results.insertId;
          let total = 0;
          const promises = membresias.map((membresia) => {
            return new Promise((resolve, reject) => {
              connection.query(
                "SELECT PRECIO FROM MEMBRESIAS WHERE ID = ?",
                [membresia.membresiaId],
                (error, results) => {
                  if (error || results.length === 0) {
                    return reject("Membresía no encontrada");
                  }

                  const precioUnitario = results[0].PRECIO;
                  const subtotal = precioUnitario * membresia.cantidad;
                  total += subtotal;

                  connection.query(
                    "INSERT INTO DETALLE_ORDEN (ORDEN_ID, MEMBRESIA_ID, CANTIDAD, PRECIO_UNITARIO) VALUES (?, ?, ?, ?)",
                    [
                      orderId,
                      membresia.membresiaId,
                      membresia.cantidad,
                      precioUnitario,
                    ],
                    (error, results) => {
                      if (error) {
                        return reject("Error al agregar membresía");
                      }
                      resolve();
                    }
                  );
                }
              );
            });
          });

          Promise.all(promises)
            .then(() => {
              connection.query(
                "UPDATE ORDENES SET TOTAL = ? WHERE ID = ?",
                [total, orderId],
                (error, results) => {
                  if (error) {
                    return connection.rollback(() => {
                      res.status(500).json({
                        message: "Error al actualizar total de la orden",
                        error,
                      });
                    });
                  }

                  connection.commit((err) => {
                    if (err) {
                      return connection.rollback(() => {
                        res.status(500).json({
                          message: "Error al confirmar transacción",
                          error: err,
                        });
                      });
                    }

                    res.json({
                      message: "Orden creada con éxito",
                      orderId: orderId,
                    });
                  });
                }
              );
            })
            .catch((error) => {
              connection.rollback(() => {
                res
                  .status(500)
                  .json({ message: "Error al procesar membresías", error });
              });
            });
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

module.exports = {
  crearOrdenConMembresias,
  finalizarOrden,
};
