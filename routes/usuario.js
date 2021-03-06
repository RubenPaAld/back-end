var express = require('express');
var bcrypt = require('bcryptjs');
var mAuthentication = require('../middleware/autentication');
var app = express();
var Usuario = require('../models/usuario');

/*
Obtener todos los usuarios GET
 */
app.get('/',(req,res,next) => {


    var offset = req.query.offset || 0;
    offset = Number(offset);

    Usuario.find({}, 'nombre email img role google')
        .skip(offset)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: true,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            Usuario.countDocuments({} ,(err, count) => {

                res.status(200).json({
                    ok:true,
                    usuarios: usuarios,
                    total: count,
                });
            });

    });
});


/*
Actualizar usuario PUT
 */
app.put('/:id', [mAuthentication.verificationToken, mAuthentication.verificaADMIN_ROLE_OR_SAME_USERR] ,(req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar el usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + ' no existe',
                errors: { message: 'No eixiste un usuario con ese ID'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualiar usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
            });
        });
    });
});


/*
Crear un nuevo usuario POST
 */
app.post('/',(req,res) => {

    var body = req.body;

    var usuario = new Usuario({

        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });

    usuario.save( (err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            body: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});


/*
Borrar usuario DELETE
 */
app.delete('/:id',[mAuthentication.verificationToken, mAuthentication.verificaADMIN_ROLE], (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: {message: 'no existe ningun usuario con el id '+id,}
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
        });
    });
});

//===============================================
module.exports = app;