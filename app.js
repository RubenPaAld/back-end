//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//inicializar variables
var app = express();


//CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});


//BodyParser
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }));
    // parse application/json
    app.use(bodyParser.json());


//conexion db
mongoose.connection.openUri('mongodb://localhost:27017/hospital', { useNewUrlParser: true }, (err,res)=> {
    if (err) throw err;

    console.log('Base de datos hospitales en el puerto 27017: \x1b[32m%s\x1b[0m','online');
});

//serve-index
/*

const serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'));
app.use('/uploads',serveIndex(__dirname + '/uploads', {'icons': true}));
*/


//importar rutas
const appRoutes = require('./routes/app');
const userRoutes = require('./routes/usuario');
const loginRoutes = require('./routes/login');
const hospitalRoutes = require('./routes/hospitales');
const medicosRoutes = require('./routes/medicos');
const busquedaRoutes = require('./routes/busqueda');
const uploadRoutes = require('./routes/upload');
const imagenesRoutes = require('./routes/imagenes');


//rutas
app.use('/imagenes', imagenesRoutes);
app.use('/upload', uploadRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicosRoutes);
app.use('/', appRoutes);

//escuchar peticiones
app.listen(3000, ()=> {
    console.log('express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m','online');
});