const express = require('express');
const formidable = require('formidable');
const readChunk = require('read-chunk'); // npm install read-chunk
const fileType = require('file-type');
const fs = require('fs');

const Hospital = require('../models/hospital');
const Usuario = require('../models/usuario');
const Medico = require('../models/medico');

const app = express();

app.put('/:tipo/:id',(req,res,next) => {

    const tipo = req.params.tipo;
    const id = req.params.id;

    const tiposValidos = ['medicos','hospitales','usuarios'];

    //verificacion de que el tipo es valido
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'tipo no valida',
            errors: { message: 'Los tipos validos son ' +  tiposValidos.join(', ')}
        });
    }
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {

        if (files) {

            const old_path = files.imagen.path;
            //const file_size = files.imagen.size;

            const buffer = readChunk.sync(old_path, 0, 12); //leemos la imagen
            const realType =  fileType(buffer); //obtenemos el tipo real

            if (!realType.mime.startsWith('image')) { //verificamos que el tipo real sea una imagen
                return res.status(400).json({
                    ok:false,
                    mensaje: 'El archivo subido no es un tipo de imagen valido',
                });
            }

            const nameArchivo = `${id}-${new Date().getMilliseconds()}.${realType.ext}`;
            const pathNew = `./uploads/${tipo}/${nameArchivo}`;

            subirPorTipo (tipo, id, nameArchivo, old_path,pathNew,res);
        } else {
            return res.status(400).json({
                ok:false,
                mensaje: 'No se subio ningun archivo',


            });
        }
    });
});

function subirPorTipo (tipo, id, nameArchivo, temporalImage, pathNew, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (err) {
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Fallo al encontrar el hospital con id: ' + id,
                    error: err
                });
            }

            const oldPath = './uploads/usuarios/' + usuario.img;

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            usuario.img = nameArchivo;

            usuario.save((err, usuarioActualizado) => {

                if (err) {
                    return res.status(400).json({
                        ok:false,
                        mensaje: 'Fallo al actualizar el usuario',
                        error: err
                    });
                }

                usuarioActualizado.password = undefined;

                fs.readFile(temporalImage, (err, data) => {
                    fs.writeFile(pathNew, data, (err) => {
                        if (err) {
                            return res.status(500).json({
                                'success': false,
                                error: err
                            });
                        } else {

                            return res.status(200).json({
                                'success': true,
                                'mensaje': 'Imagen de usuario actualizada',
                                usuario: usuarioActualizado
                            });
                        }
                    });
                });



            });

        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (err) {
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Fallo al encontrar el medico con id: ' + id,
                    error: err
                });
            }

            const oldPath = './uploads/medicos/' + medico.img;

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            medico.img = nameArchivo;

            medico.save((err, medicoActualizado) => {

                if (err) {
                    return res.status(400).json({
                        ok:false,
                        mensaje: 'Fallo al actualizar el medico',
                        error: err
                    });
                }

                fs.readFile(temporalImage, (err, data) => {
                    fs.writeFile(pathNew, data, (err) => {
                        if (err) {
                            return res.status(500).json({
                                'success': false,
                                error: err
                            });
                        } else {

                            return res.status(200).json({
                                'success': true,
                                'mensaje': 'Imagen de medico actualizada',
                                medico: medicoActualizado
                            });
                        }
                    });
                });



            });

        });
    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (err) {
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Fallo al encontrar el hospital con id: ' + id,
                    error: err
                });
            }

            const oldPath = './uploads/hospitales/' + hospital.img;

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            hospital.img = nameArchivo;

            hospital.save((err, hospitalActualizado) => {

                if (err) {
                    return res.status(400).json({
                        ok:false,
                        mensaje: 'Fallo al actualizar el hospital',
                        error: err
                    });
                }

                fs.readFile(temporalImage, (err, data) => {
                    fs.writeFile(pathNew, data, (err) => {
                        if (err) {
                            return res.status(500).json({
                                'success': false,
                                error: err
                            });
                        } else {

                            return res.status(200).json({
                                'success': true,
                                'mensaje': 'Imagen de hospital actualizada',
                                hospital: hospitalActualizado
                            });
                        }
                    });
                });
            });

        });
    }

}


module.exports = app;