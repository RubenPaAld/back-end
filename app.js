//Requires
var express = require('express');
var mongoose = require('mongoose');

//inicializar variables
var app = express();

//conexion db
mongoose.connection.openUri('mongodb://localhost:27017/hospital', { useNewUrlParser: true }, (err,res)=> {
    if (err) throw err;

    console.log('Base de datos hospital en el puerto 27017: \x1b[32m%s\x1b[0m','online');
});

//rutas
app.get('/',(req,res,next) => {
    res.status(200).json({
        ok:true,
        mensaje: 'peticion realizada con exito'
    });
});


//escuchar peticiones
app.listen(3000, ()=> {
    console.log('express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m','online');
});