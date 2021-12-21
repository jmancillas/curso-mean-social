'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
    name: String,
    surname: String,
    nick: String,
    email: String,
    password: String,
    role: String,
    image: String
});

//exportar el modelo. al guardar en la db se pluraliza el nombre y se escribe en minuscula

module.exports = mongoose.model('User', UserSchema);