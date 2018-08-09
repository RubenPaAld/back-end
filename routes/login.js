const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const SEED = require('../config/config').SEED;
const Usuario = require('../models/usuario');

//google
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

//autentificacion normal
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
            id: userDb.id,
            menu: obtenerMenu(userDb.role)
        });

    });

});


//autentificacion con Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];

    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    }
}

app.post('/google', async(req, res) => {

    const token = req.body.token;

    const googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'

            });
        });

    Usuario.findOne({ email: googleUser.email } ,(err, userDb) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (userDb) { // si ya esta registrado el correo de google

            if (userDb.google === false) { //si ya existe un usuario registrado con el correo de google lo rechazamos y le pedimos un login normal
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autentificacion normal',
                    errors: err
                });
            } else {//retornamos el usuario
                const token = jwt.sign({usuario: userDb}
                    , SEED
                    , {expiresIn: 14400}
                ); //4horas

                res.status(200).json({
                    ok: true,
                    usuario: userDb,
                    token: token,
                    id: userDb.id,
                    menu: obtenerMenu(userDb.role)
                });
            }
        } else { //creamos el usuario con la cuenta de google
            const user = new Usuario();

            user.nombre = googleUser.nombre;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ':)';

            user.save((err, userDb2) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuario',
                        errors: err
                    });
                }

                var token = jwt.sign({usuario: userDb2}
                    , SEED
                    , {expiresIn: 14400}
                ); //4horas

                res.status(200).json({
                    ok: true,
                    usuario: userDb2,
                    token: token,
                    id: userDb2.id,
                    menu: obtenerMenu(userDb2.role)
                });


            });
        }
    });
});

function obtenerMenu(ROLE) {

    var menu = [
        {
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                {titulo: 'DashBoard', url: '/dashboard'},
                {titulo: 'Progress', url: '/progress'},
                {titulo: 'Graficas', url: '/graficas1'},
                {titulo: 'Promesas', url: '/promesas'},
                {titulo: 'Rxjs', url: '/rxjs'},
                {titulo: 'Opciones', url: '/account-settings'},
            ]
        },

    ];

    console.log(ROLE);

    if (ROLE === 'ADMIN_ROLE'){
        //menu[1].submenu.unshift({titulo: 'Usuarios', url: '/usuarios'},{titulo: 'Hospitales', url: '/hospitales'},{titulo: 'Medicos', url: '/medicos'});
        menu.push({
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                {titulo: 'Usuarios', url: '/usuarios'},
                {titulo: 'Hospitales', url: '/hospitales'},
                {titulo: 'Medicos', url: '/medicos'},
            ]
        });
    }

    return menu;
}

module.exports = app;