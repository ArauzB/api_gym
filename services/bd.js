
const caPath = './ca.pem';
const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();
const {HOST, PORT_BD, USER_BD, PASSWORD, DATABASE} = process.env;

const connectionConfig = {
  host: HOST,
  port: PORT_BD,
  user: USER_BD,
  password: PASSWORD, 
  database: DATABASE,
  ssl: {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  },
};


const prueba = async () => {
  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log('Conexión exitosa a la base de datos MySQL.');
    return connection;
  } catch (error) {
    console.error('Error al conectar a la base de datos MySQL:', error);
    throw error;
  }
};

const connection = mysql.createConnection(connectionConfig);



module.exports = { connection, prueba };