'use strict'

// cargar express

var express = require('express');
var FollowController = require('../controllers/follow');

var api = express.Router()
var md_auth = require('../middlewares/authenticated')

api.post('/follow', md_auth.ensureAuth, FollowController.saveFollow);
api.delete('/follow/:id', md_auth.ensureAuth, FollowController.deleteFollow);
api.get('/follow/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowingUsers);

module.exports = api;