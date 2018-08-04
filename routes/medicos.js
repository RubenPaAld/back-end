var express = require('express');
var bcrypt = require('bcryptjs');
var mAuthentication = require('../middleware/autentication');
var app = express();
var Medico = require('../models/medico');

/*
Obtener todos los medicos GET
 */
app.get('/',(req,res,next) => {

    var offset = req.query.offset || 0;
    offset = Number(offset);

    Medico.find({})
        .skip(offset)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: true,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }
            Medico.countDocuments({} ,(err, count) => {

                res.status(200).json({
                    ok:true,
                    medicos: medicos,
                    total: count
                });
            });
    });
});


/*
Actualizar medicos PUT
 */
app.put('/:id', mAuthentication.verificationToken ,(req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar el medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id' + id + ' no existe',
                errors: { message: 'No eixiste un medico con ese ID'}
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( (err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualiar medico',
                    errors: err
                });
            }
            medicoGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                body: medicoGuardado,
            });
        });
    });
});


/*
Crear un nuevo medico POST
 */
app.post('/', mAuthentication.verificationToken ,(req,res) => {

    var body = req.body;

    var medico = new Medico({

        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            body: medicoGuardado,
            usuarioToken: req.usuario
        });
    });
});


/*
Borrar medico DELETE
 */
app.delete('/:id',mAuthentication.verificationToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: {message: 'no existe ningun medico con el id '+id,}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: medicoBorrado,
        });
    });
});

//===============================================
module.exports = app;