var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

exports.verificationToken = function(req,res,next) {

    var token = req.query.token;
    jwt.verify( token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;
        next();
    });

};

exports.verificaADMIN_ROLE = function(req,res,next) {

    var usuario = req.usuario;
    
    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'token incorrecto - No es administrador',
            errors: {message: 'No es admin'}
        });
    }

};

exports.verificaADMIN_ROLE_OR_SAME_USERR = function(req,res,next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'token incorrecto - No es administrador ni mismo usuario',
            errors: {message: 'No es admin o mismo usuario'}
        });
    }

};

/*
Verificar token
 */
