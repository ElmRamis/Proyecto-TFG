const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // Importar las rutas de autenticación
const app = express();
require('dotenv').config(); // Cargar variables de entorno desde el archivo .env



// Conectar a la base de datos MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a la base de datos'))
    .catch(err => console.error('Error al conectar a la base de datos', err));

// Middleware para parsear solicitudes JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}))

const mongo_uri = 'mongodb://dev:dev@localhost/todos';

mongoose.connect(mongo_uri, function(err){
    if (err) {
        throw err;
    } else {
        console.log(`Conected to ${mongo_uri}`);
    }
});

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Usar las rutas de autenticación
app.use('/', authRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
