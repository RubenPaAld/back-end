var express = require('express');
var mAuthentication = require('../middleware/autentication');
var app = express();
var Hospital = require('../models/hospital');

/*
Obtener todos los hospitales GET
 */
app.get('/',(req,res,next) => {

    var offset = req.query.offset || 0;
    offset = Number(offset);

    Hospital.find({})
        .skip(offset)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: true,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }
            Hospital.countDocuments({} ,(err, count) => {

                res.status(200).json({
                    ok:true,
                    hospitales: hospitales,
                    total: count
                });
            });
        });
});


/*
Actualizar hospitales PUT
 */
app.put('/:id', mAuthentication.verificationToken ,(req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar el hospitales',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospitales con el id' + id + ' no existe',
                errors: { message: 'No eixiste un hospitales con ese ID'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id

        hospital.save( (err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualiar hospitales',
                    errors: err
                });
            }
            hospitalGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                body: hospitalGuardado,
            });
        });
    });
});


/*
Crear un nuevo medico POST
 */
app.post('/', mAuthentication.verificationToken ,(req,res) => {

    var body = req.body;

    var hospital = new Hospital({

        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear hospitales',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            body: hospitalGuardado,
            usuarioToken: req.usuario
        });
    });
});


/*
Borrar medico DELETE
 */
app.delete('/:id',mAuthentication.verificationToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospitales',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar el hospitales',
                errors: {message: 'no existe ningun hospitales con el id '+id,}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
        });
    });
});

//===============================================
module.exports = app;