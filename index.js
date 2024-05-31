const express = require('express');
const cors = require('cors');
const app = express();


const rutas = require('./routes/index.js');
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(cors()); 
app.use(express.json());
app.use('/',rutas);



const port = process.env.PORT || 3000; 
app.listen(port, () => {
  console.log(' 🚀 El servidor ha despegado en el puerto ', port);
});