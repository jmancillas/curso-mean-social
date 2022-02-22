'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    followed: { type: Schema.ObjectId, ref: 'User' }
});

//exportar el modelo. al guardar en la db se pluraliza el nombre y se escribe en minuscula

module.exports = mongoose.model('Follow', FollowSchema);