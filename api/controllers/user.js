'use strict'

// importar modelo

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination')
var fs = require('fs')
var path = require('path')

var User = require('../models/user');
var Follow = require('../models/follow');
var jwt = require('../services/jwt');

//register
function saveUser(req, res) {
    var params = req.body;
    var user = new User()

    if (params.name && params.surname && params.nick && params.password && params.email) {

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        //validar si usuario ya existe
        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {
            if (err) {
                return res.status(500).send({ message: 'error en la peticion de usuarios' })
            }
            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'el usuario que intenta guardar ya existe' })
            }
            else {
                //encripta pass y guarda 
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if (err) {
                            return res.status(200).send({ message: 'error al guardar el usuario' })
                        }
                        if (userStored) {
                            res.status(200).send({ user: userStored })
                        }
                        else {
                            res.status(500).send({ message: 'error en el servidor, no se guardo el usuario' })
                        }
                    });
                });
            }
        });

    }
    else {
        res.status(200).send({
            message: "todos los campos son requeridos"
        })
    }
}

//login
function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'no se pudo identificar el usuario' })

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {

                if (check) {

                    if (params.gettoken) {

                        return res.status(200).send({
                            token: jwt.createToken(user)
                        })
                    } else {
                        user.password = undefined
                        return res.status(200).send({ user })
                    }
                }
                else { return res.status(404).send({ message: 'el usuario no se ah podido identificar' }) }
            })
        }
        else { return res.status(404).send({ message: 'usuario o contraseña invalidos' }) }
    })
}

//obtener un usuario
function getUser(req, res) {
    var userId = req.params.id

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'error en la peticion' })
        if (!user) return res.status(404).send({ message: 'el usuario no existe' })

        followThisuser(req.user.sub, userId).then((value) => {
            user.password = undefined;

            return res.status(200).send({
                user,
                followind: value.following,
                followed: value.followed
            })
        })
    })
}

async function followThisuser(identity_user_id, user_id) {
    var following = await Follow.findOne({ "user": identity_user_id, "followed": user_id }).exec((err, follow) => {
        if (err) return handleError(err);
        return follow
    })

    var followed = await Follow.findOne({ "user": user_id, "followed": identity_user_id }).exec((err, follow) => {
        if (err) return handleError(err);
        return follow
    })

    return {
        following: following,
        followed: followed
    }
}

//devolver lista de usuarios, usando paginacion 
function getUsers(req, res) {
    var identity_user_id = req.user.sub
    var page = 1
    var itermPerPage = 5

    if (req.params.page) {
        page = req.params.page
    }

    User.find().sort('_id').paginate(page, itermPerPage, (err, user, total) => {
        if (err) return res.status(500).send({ message: 'error en la peticion' })
        if (!user) return res.status(404).send({ message: 'no se encontraron usuarios' })

        return res.status(200).send({
            user,
            total,
            pages: Math.ceil(total / itermPerPage)

        })
    })
}

// async function followUserIds(user_id){
//     var following = await
// }

//actualizar usuarios
function updateUser(req, res) {
    var userId = req.params.id
    var update = req.body

    //borrar propiedad pass
    delete update.password

    if (userId != req.user.sub) return res.status(500).send({ message: 'no tienes permiso para actulizar este usuario' })

    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
        if (err) return res.status(500).send({ message: 'error en la peticion' })
        if (!userUpdated) return res.status(404).send({ message: 'no se ha podido encontrar el  usuario' })

        return res.status(200).send({ user: userUpdated })
    })
}

//cargar una imagen de avatar
function uploadImage(req, res) {
    var userId = req.params.id

    if (userId != req.user.sub) return res.status(500).send({ message: 'no tienes permiso para actulizar este usuario' })

    if (req.files) {
        var filePath = req.files.image.path

        var fileSplit = filePath.split('\\')
        var fileName = fileSplit[2]
        var fileExt = req.files.image.type

        if (userId != req.user.sub) return removeFilesOfUploads(res, filePath, 'no tienes permiso para actulizar este usuario')

        if (fileExt == 'image/png' || fileExt == 'image/jpg' || fileExt == 'image/jpeg' || fileExt == 'image/gif') {
            //actualizar el nombre en db

            User.findByIdAndUpdate(userId, { image: fileName }, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'error en la peticion' })
                if (!userUpdated) return res.status(404).send({ message: 'no se ha podido encontrar el  usuario' })

                return res.status(200).send({ user: userUpdated })
            })
        }
        else {
            return removeFilesOfUploads(res, filePath, 'extencion no valida')
        }
    }

}

function getImageUser(req, res) {
    var imageFile = req.params.imageFile
    var pathFile = './uploads/users/' + imageFile

    fs.exists(pathFile, (exist) => {
        if (exist) {
            res.sendFile(path.resolve(pathFile))
        }
        else {
            res.status(200).send({ message: 'no existe la imagen' })
        }
    })
}

function removeFilesOfUploads(res, filePath, message) {
    fs.unlink(filePath, (err) => {
        return res.status(200).send({ message: message })
    })
}

//exportar las funciones
module.exports = {
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageUser
}