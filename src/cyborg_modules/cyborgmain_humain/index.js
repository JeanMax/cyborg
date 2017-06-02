#!/usr/bin/env node

var express = require('express');
var io      = require('socket.io');
var path = require("path");
var argv = require('minimist')(process.argv.slice(2));


var app     = express();

var port = argv.p;
var listPlayer = argv._;
var number_of_players = listPlayer.length; //TODO: do not hardcore, send param

var server  = app.listen(port, function () {
  console.log('Example app listening on port '+port)
  process.send({ state: "READY"});
});
var sio      = io.listen(server);



// var staticFolder = path.join(__dirname, "./client/static");
app.use("/static", express.static(path.join(__dirname, "/client/static")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/client"));


var results = {},
	players = {};

function check_results() {
	function  send_msg_to_team(team, msg) {
		for (var player in players) {
			if (results[player] === team) {
				players[player].emit("status_update", msg);
			} else if (msg === "win") {
				players[player].emit("status_update", "loose");
			} else if (msg === "play") {
				players[player].emit("status_update", "wait");
			}
		}
	}

	function  send_msg_to_all(msg) {
		for (var player in players) {
			players[player].emit("status_update", msg);
		}
	}

	function check_team_results(number_in_team, team) {
		if (number_in_team == 1) {
			console.log(team + " wins"); // DEBUG
			send_msg_to_team(team, "win");
		} else if (number_in_team == 2) {
			console.log(team + " shifumi"); // DEBUG
			send_msg_to_team(team, "win");
			//TODO: call shifumi
		} else {
			console.log(team + " play again"); // DEBUG
			send_msg_to_team(team, "play");
			//TODO: play again with TEAM
		}
	}

	var number_of_cyborgs = 0;
	for (var id in results) {
		if (results[id] === "cyborgmain") {
			number_of_cyborgs++;
		}
	}

	if (number_of_cyborgs === number_of_players / 2 ||
		number_of_cyborgs === number_of_players ||
		!number_of_cyborgs) {
		send_msg_to_all("play");
	} else if (number_of_cyborgs > number_of_players / 2) {
		check_team_results(number_of_players - number_of_cyborgs, "humain");
	} else {
		check_team_results(number_of_cyborgs, "cyborgmain");
	}

	results = {};
}


app.get("/",function (req,res,next) {
    res.render("cyborgmain_humain");
});

// app.listen(port, function () {
//   console.log('Example app listening on port '+port)
//   // process.send({ state: "READY"});
// })

sio.on("connection", function(socket){

	socket.on("init", function(msg){
		if (!(socket.id in players)) {
			players[socket.id] = socket;
		}
	});
	//TODO: handle disconnect
	//TODO: wait for players

	socket.on("result", function(msg){
		//save results/player
		if (!(socket.id in results)) {
			results[socket.id] = msg;
		}

		//everybody played
		if (Object.keys(results).length === number_of_players) {
			check_results();
		} else {
			socket.emit("status_update", "wait");
		}
	});

});
