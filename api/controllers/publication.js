'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination')
var fs = require('fs')
var path = require('path')
var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
const { totalmem } = require('os');

function savePublication(req, res) {
    var params = req.body;
    if (!params.text) return res.status(200).send({ message: 'Debes enviar un texto!' });

    var publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    publication.save((err, publicationStored) => {
        if (err) return res.status(500).send({ message: 'Error al guardar publicacion' });
        if (!publicationStored) return res.status(404).send({ message: 'la publicacion NO pudo ser guardada' });

        return res.status(200).send({ publication: publicationStored })
    })
}

function getPublications(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;
    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error al obtener el seguimiento' });

        var follow_clean = [];

        follows.forEach(follow => {
            follow_clean.push(follow.folloed);
        });

        console.log(follows);
        Publication.find({ user: { "$in": follow_clean } })
            .sort('-created_at')
            .populate('user')
            .paginate(page, itemsPerPage, (err, publications, total) => {
                if (err) return res.status(500).send({ message: 'Error al obtener publicaciones' });
                if (!publications) return res.status(404).send({ message: 'No hay publicaciones' });

                return res.status(200).send({
                    total_items: total,
                    pages: Math.ceil(total / itemsPerPage),
                    page: page,
                    publications
                });
            });
    });
}

function getPublication(req, res) {
    var publicacionId = res.params.id;

    Publication.findById(publicacionId, (err, publication) => {
        if (err) return res.status(500).send({ message: 'Error al devolver publicaciones' })
        if (!publication) return res.status(404).send({ message: 'No existe la publicacion' })

        return res.status(200).send({ publication });

    })
}

function deletePublication(req, res) {
    var publicacionId = req.params.id;

    Publication.find({ 'user': req.user.sub, '_id': publicacionId }).remove(err => {
        if (err) return res.status(500).send({ message: 'Error al borrar publicacion' })
        if (!publicationRemoved) return res.status(404).send({ message: 'No existe la publicacion' })

        return res.status(200).send({ message: 'Publicacion eliminada correctamente' })
    });
}

//cargar una imagen de avatar
function uploadImage(req, res) {
    var publicationId = req.params.id

    if (publicationId != req.user.sub) return res.status(500).send({ message: 'no tienes permiso para actulizar este usuario' })

    if (req.files) {
        var filePath = req.files.image.path

        var fileSplit = filePath.split('\\')
        var fileName = fileSplit[2]
        var fileExt = req.files.image.type

        if (fileExt == 'image/png' || fileExt == 'image/jpg' || fileExt == 'image/jpeg' || fileExt == 'image/gif') {
            //actualizar el nombre en db

            Publication.findOne({ 'user': req.user.sub, '_id': publicationId }).exec((err, publication) => {
                if (publication) {
                    Publication.findByIdAndUpdate(publicationId, { image: fileName }, { new: true }, (err, publicationUpdated) => {
                        if (err) return res.status(500).send({ message: 'error en la peticion' })
                        if (!publicationUpdated) return res.status(404).send({ message: 'no se ha podido encontrar el  usuario' })

                        return res.status(200).send({ user: publicationUpdated })
                    })
                } else {
                    return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar la publicacion')
                }
            })
        }
        else {
            return removeFilesOfUploads(res, filePath, 'extencion no valida')
        }
    }

}

function removeFilesOfUploads(res, filePath, message) {
    fs.unlink(filePath, (err) => {
        return res.status(200).send({ message: message })
    })
}

function getImageUser(req, res) {
    var imageFile = req.params.imageFile
    var pathFile = './uploads/users/' + imageFile

    fs.existsSync(pathFile, (exist) => {
        if (exist) {
            res.sendFile(path.resolve(pathFile))
        }
        else {
            res.status(200).send({ message: 'no existe la imagen' })
        }
    })
}

module.exports = {
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageUser
}