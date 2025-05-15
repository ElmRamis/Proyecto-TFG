const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sesion-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conexión exitosa a la base de datos'))
.catch(err => console.error('Error al conectar a la base de datos:', err));
