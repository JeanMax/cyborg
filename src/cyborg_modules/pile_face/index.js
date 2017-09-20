#!/usr/bin/env node

'use strict';

const express = require('express');
const http = require('http');
const socket = require('socket.io');
// const $ = require("jquery");
const path = require('path')
var game = require('./client/static/js/pile_face.js');
var argv = require('minimist')(process.argv.slice(2));
game = new game();

const PORT = argv.p || process.env.PORT || 80;
console.log('port: ', PORT);

// App
const app = express();


// Server
const server = http.Server(app);


// Socket
const io = socket.listen(server);

// app.use('/jquery', express.static(__dirname + '/js/'))
app.use("/static", express.static(path.join(__dirname, "/client/static")));;
app.set('views', path.join(__dirname, 'views'))


// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('pile_face.ejs');
});

io.on('connection', function (socket, pseudo) {

	game.joinRoom(io, socket);

	socket.on('disconnect', function() {

		io.in(socket.room).emit('message', 'your opponent is gone!');
		Object.keys(io.sockets.in(socket.room).sockets).forEach(function(id) {
			if (id != socket.id && io.sockets.sockets[id] != null) {
				game.joinRoom(io, io.sockets.sockets[id]);
			}
		});

	 });

	 socket.on('choice', function (choice) {
		game.check_choice(io, socket, choice);

	});
});

server.listen(PORT, function () {
	process.send({state:"READY"});
})

console.log('Running on port: ' + PORT);
