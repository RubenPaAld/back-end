//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//inicializar variables
var app = express();

//BodyParser
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }));
    // parse application/json
    app.use(bodyParser.json());


//conexion db
mongoose.connection.openUri('mongodb://localhost:27017/hospital', { useNewUrlParser: true }, (err,res)=> {
    if (err) throw err;

    console.log('Base de datos hospital en el puerto 27017: \x1b[32m%s\x1b[0m','online');
});

//importar rutas
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');


//rutas
app.use('/', appRoutes);
app.use('/user', userRoutes);
app.use('/login', loginRoutes);

//escuchar peticiones
app.listen(3000, ()=> {
    console.log('express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m','online');
});