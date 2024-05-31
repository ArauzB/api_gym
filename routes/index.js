const express = require('express');
const router = express();

const auth = require('./auth.route');
const cliente = require('./cliente.route');

const citas = require('./citas.route');
const empleado = require('./empleado.route');
const orders = require('./orders.route');
const productos = require('./productos.route');

router.use('/auth', auth);
router.use('/cliente', cliente);
router.use('/citas', citas);
router.use('/empleado', empleado);
router.use('/orders', orders);
router.use('/productos', productos);




module.exports = router; 