var express = require("express");
var app = express();
var server = require("http").Server(app);
var path = require("path");
var io = require("socket.io")(server);
var number_of_players = 4; //TODO: do not hardcore, send param

app.use("/static", express.static(path.join(__dirname, "./client/static")));

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

io.on("connection", function(socket){

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


app.get("/",function (req,res,next) {
    res.render("cyborgmain_humain");
});

server.listen(4242);
