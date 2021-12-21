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
//exportar las funciones

module.exports = {
    saveFollow,
    deleteFollow
}