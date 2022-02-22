'use strict'

// importar modelo
var mongoosePaginate = require('mongoose-pagination')
var fs = require('fs')
var path = require('path')

var User = require('../models/user');
var Follow = require('../models/follow');

//segir un usuario
function saveFollow (req, res) {
    var params = req.body

    var follow = new Follow
    follow.user = req.user.sub
    follow.followed = params.followed

    follow.save((err, followeStored) => {
        if(err) return res.status(500).send({ message: 'error en la peticion'})
        if(!followeStored) return res.status(404).send({ message: 'no se completo la operacion'})

        return res.status(200).send({follow: followeStored})
    })
}

//dejar de segir
function deleteFollow(req, res){
    var userId = req.user.sub
    var followId = req.params.id

    Follow.find({'user': userId, 'followed': followId}).remove(err => {
        if(err) return res.status(500).send({ message: 'error en la peticion'})

        return res.status(200).send({message: 'el follow se ah elimidado'})
    })
}

//obtener lista paginada de usuarios que sigo
function getFollowingUsers(req, res){
    var userId = req.params.sub;
    if(req.params.id && req.params.page) userId = req.params.id;

    var page = 1;
    if(req.params.page) page = req.params.page;
    else page = req.params.id;

    var itemsPerPage = 4;
    Follow.find({user:userId}).populate({path: 'followed'}).paginate(page, itemsPerPage, (err, follows, total) =>{
        if(err) return res.status(500).send({message: 'error interno en el servidor'})
        if(!follows) return res.status(404).send({message: 'no estas siguiendo a ningun usuario'})

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        })
    })
}

//obtener lista paginada de usuarios que me siguen
function getFollowedUsers(req, res){
    var userId = req.params.sub;
    if(req.params.id && req.params.page) userId = req.params.id;

    var page = 1;
    if(req.params.page) page = req.params.page;
    else page = req.params.id;

    var itemsPerPage = 4;
    Follow.find({followed:userId}).populate('user followed').paginate(page, itemsPerPage, (err, follows, total) =>{
        if(err) return res.status(500).send({message: 'error interno en el servidor'})
        if(!follows) return res.status(404).send({message: 'no te sigue a ningun usuario'})

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        })
    })
}

//lista de usuarios sin paginar
function getMyFollows(req, res){
    var userId = req.user.sub;
    var find = null;

    if(req.params.followed){
        find = Follow.find({followed: userId})
    }else{
        find = Follow.find({user: userId});
    }

    find.populate('user followed').exec((err, follows) => {
        if(err) return res.status(500).send({message: 'Error en el servidor'});
        if(!follows) return res.status(404).send({message: 'No sigues ningun usuario'})

        return res.status(200).send({follows});
    });
}

//exportar las funciones
module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
}