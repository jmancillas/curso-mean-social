'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'clave_secrete_desarrollar_red_social_angular'

exports.ensureAuth = function(req, res, next){
    if(!req.headers.authorization){
        return res.status(403).send({message: 'La peticion no contiende la cabezera de autorizacion'})   
    }
    var Token = req.headers.authorization.replace(/['"]+/g, '')
    
    try{
        var payload = jwt.decode(Token, secret)

        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                message: 'El token ah expirado'
            })
        }
    }catch(err){
        return res.status(404).send({
            message: 'El Token no es valido'
        })
    }
    req.user = payload

    next()
}