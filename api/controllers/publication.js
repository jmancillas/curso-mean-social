'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination')
var fs = require('fs')
var path = require('path')
var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
const { totalmem } = require('os');

function savePublication(req, res) {
    var params = req.body;
    if (!params.text) return res.status(200).send({ message: 'Debes enviar un texto!' });

    var publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    publication.save((err, publicationStored) => {
        if (err) return res.status(500).send({ message: 'Error al guardar publicacion' });
        if (!publicationStored) return res.status(404).send({ message: 'la publicacion NO pudo ser guardada' });

        return res.status(200).send({ publication: publicationStored })
    })
}

function getPublications(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;
    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error al obtener el seguimiento' });

        var follow_clean = [];

        follows.forEach(follow => {
            follow_clean.push(follow.folloed);
        });

        console.log(follows);
        Publication.find({ user: { "$in": follow_clean } })
            .sort('-created_at')
            .populate('user')
            .paginate(page, itemsPerPage, (err, publications, total) => {
                if (err) return res.status(500).send({ message: 'Error al obtener publicaciones' });
                if (!publications) return res.status(404).send({ message: 'No hay publicaciones' });

                return res.status(200).send({
                    total_items: total,
                    pages: Math.ceil(total / itemsPerPage),
                    page: page,
                    publications
                });
            });
    });
}

module.exports = {
    savePublication,
    getPublications
}