'use strict'

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/probando-md', md_auth.ensureAuth, MessageController.prueba);
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/my-message/:page?', md_auth.ensureAuth, MessageController.getReceivedMessages);

module.exports = api;