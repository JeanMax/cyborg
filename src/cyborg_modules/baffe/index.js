#!/usr/bin/env node

"use strict";

var express = require('express');
var io = require('socket.io');
var path = require("path");
var argv = require('minimist')(process.argv.slice(2));


var app = express();

var port = argv.p;
var listPlayer = argv._;
var number_of_players = listPlayer.length; //TODO: do not hardcode, send param

var server = app.listen(port, function () {
	console.log('Example app listening on port ' + port);
	process.send({state: "READY"});
});
var sio = io.listen(server);

app.use("/static", express.static(path.join(__dirname, "/client/static")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/client"));

app.get("/", function (req,res,next) {
	res.render("baffe");
});


const INITIAL_LIFE = 42;
var players = [], //player = {socket, life, name}
	sockets = [];

function get_player_from_socket(player_socket) {
	for (var i = 0; i < players.length; i++) {
		if (sockets[i].id === player_socket.id) {
			return i;
		}
	}

	return undefined;
}

function interact(player_socket, target_player_id, bonus) {
	if (players[get_player_from_socket(player_socket)].life <= 0) {
		return false; // caster is dead
	}
	if (players[target_player_id].life <= 0) {
		return false; // target is dead
	}

	players[target_player_id].life += bonus;

	return true;
}

function get_last_survivor() {
	var last_survivor_id;

	for (var i = 0; i < players.length; i++) {
		if (players[i].life > 0) {
			if (last_survivor_id === undefined) {
				last_survivor_id = i;
			} else {
				return undefined;
			}
		}
	}

	return last_survivor_id;
}

function send_update() {
	var msg = { "players": players },
		last_survivor_id = get_last_survivor();

	for (var i = 0; i < players.length; i++) {
		msg.client_id = i;

		if (i === last_survivor_id) {
			msg.status = "win";
		} else if (players[i].life > 0) {
			msg.status = "play";
		} else {
			msg.status = "loose";
		}

		sockets[i].emit("status_update", JSON.stringify(msg));
	}
}

function add_player(player_socket) {
	for (var i = 0; i < players.length; i++) {
		if (sockets[i].id === player_socket.id) {
			return false;
		}
	}

	players.push({
		"life": INITIAL_LIFE,
		"name": "player" + players.length //TODO
	});
	sockets.push(player_socket);

	return true;
}

sio.on("connection", function(socket){
	//TODO: handle disconnect
	//TODO: wait for players
	socket.on("init", function(unused_msg){
		add_player(socket);
		if (number_of_players === players.length) {
			send_update();
		}
	});

	socket.on("baffe", function(player_id){
		if (interact(socket, player_id, -1)) {
			send_update();
		}
	});

	socket.on("soin", function(player_id){
		if (interact(socket, player_id, 1)) {
			send_update();
		}
	});
});
