var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');

app.get('/todo/:termino',(req,res,next) => {

    var termino = req.params.termino;
    var regexp = new RegExp(termino,'i');


    Promise.all([
        buscarHospitales(termino,regexp),
        buscarMedicos(termino,regexp),
        buscarUsuarios(termino,regexp),
    ]).then( respuestas => {
        res.status(200).json({
            ok:true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2],
            termino: termino
        });
    } );
});

app.get('/coleccion/:tabla/:termino',(req,res) => {

    var termino = req.params.termino;
    var tabla = req.params.tabla;
    var regexp = new RegExp(termino,'i');
    var promesa;

    switch (tabla) {
        case 'usuarios': promesa = buscarUsuarios(termino,regexp);
                        break;
        case 'medicos': promesa = buscarMedicos(termino,regexp);
                        break;
        case 'hospitales': promesa = buscarHospitales(termino,regexp);
                         break;
        default:
            res.status(400).json({
                ok:false,
                mensaje: 'los tipos de buscqueda solo son usuarios, medicos y hospitales',
                error: {message: 'Tipo de tabla/coleccion no valido'}
            });
    }

    if (promesa) {
        promesa.then(data => {
            res.status(200).json({
                ok: true,
                [tabla]: data
            });
        });
    }
});

function buscarUsuarios (busqueda, regexp) {

    return new Promise ((resolve, reject) => {

        Usuario.find({}, 'nombre email role img')
            .or([{'nombre': regexp}, {'email': regexp}])
            .exec((err, usuarios) => {
                if (err) {
                    reject('error al cargar hospitales', err);
                } else  {
                    resolve(usuarios);
                }
            });

    });
}

function buscarHospitales (busqueda, regexp) {

    return new Promise ((resolve, reject) => {

        Hospital.find({nombre: regexp})
            .populate('usuario', 'nombre email')
            .exec((err,hospitales) =>{

            if (err) {
                reject('error al cargar hospitales', err);
            } else  {
                resolve(hospitales);
            }
        });
    });
}

function buscarMedicos (busqueda, regexp) {

    return new Promise ((resolve, reject) => {

        Medico.find({nombre: regexp})
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err,medicos) =>{

            if (err) {
                reject('error al cargar medicos', err);
            } else  {
                resolve(medicos);
            }
        });
    });
}

module.exports = app;