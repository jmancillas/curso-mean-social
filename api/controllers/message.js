'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function prueba(req, res) {
    res.status(200).send({ message: 'Hola que tal' });
}

function saveMessage(req, res) {
    var param = req.body;
    if (!param.text || !param.receiver) return res.status(200).send({ message: 'Enviar datos necesarios' })

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = param.receiver;
    message.text = param.text;
    message.created_at = moment().unix();

    message.save((err, messageStored) => {
        if (err) return res.status(500).send({message:'Error en la peticion'});
        if (!messageStored) return res.status(500).send({message:'Error al enviar mensaje'});

        return res.status(200).send({message:messageStored});
    })
}

function getReceivedMessages(req, res){
    var userId = req.user.sub;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 2;

    Message.find({receiver: userId}).populate('emitter', 'name surname image nick _id').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({message:'Error en la peticion'});
        if (!messages) return res.status(404).send({message:'No hay mensajes'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        })
    });
}
module.exports = {
    prueba,
    saveMessage,
    getReceivedMessages
}