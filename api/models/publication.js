'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PublicationSchema = Schema({
    text: String,
    file: String,
    created_at: String,
    user: { type: Schema.ObjectId, ref: 'User' }
});

//exportar el modelo al guardar en la db se pluraliza el nombre y se escribe en minuscula
module.exports = mongoose.model('Publication', PublicationSchema);