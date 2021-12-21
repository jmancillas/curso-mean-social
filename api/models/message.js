'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = Schema({
    text: String,
    created_at: String,
    emitter: {type: Schema.ObjectId, ref: 'User'},
    receiver: {type: Schema.ObjectId, ref: 'User'}
});

//exportar el modelo. al guardar en la db se pluraliza el nombre y se escribe en minuscula

module.exports = mongoose.model('Message', MessageSchema);