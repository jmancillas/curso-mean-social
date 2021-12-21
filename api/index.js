'user strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//conection database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/curso_mean_social',  
	{ useUnifiedTopology: true, useNewUrlParser: true, })
	.then(() => {
		console.log("La conexión a la base de datos se realizo correctamente!")

		//create server
		app.listen(port, () => {
			console.log("servidor corriendo en http://localhost:3800")
		})
	})
	.catch(err => console.log(err))