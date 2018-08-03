var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();
var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');

app.post('/', (req,res) => {

    var body = req.body;

    Usuario.findOne({email: body.email}, (err, userDb) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        if (!userDb) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!body.password || !bcrypt.compareSync(body.password, userDb.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        userDb.password = ':)';
        //crear token
        var token = jwt.sign({usuario: userDb}
                                , SEED
                                , {expiresIn: 14400}
                            ); //4horas

        res.status(200).json({
            ok: true,
            usuario: userDb,
            token: token,
            id: userDb.id
        });

    });

});









module.exports = app;