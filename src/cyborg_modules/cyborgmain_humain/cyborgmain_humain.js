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

function  send_msg_to_team(team, msg) {
	for (var player in players) {
		if (results[player] === team) {
			players[player].emit("status_update", msg);
		} else if (msg === "win") {
			players[player].emit("status_update", "loose");
		}
	}
}

function check_results(socket) {
	var number_of_cyborgs = 0;
	for (var id in results) {
		if (results[id] === "cyborgmain") { //TODO: define? cf .ejs
			number_of_cyborgs++;
		}
	}

	if (!!number_of_cyborgs && number_of_cyborgs < number_of_players / 2) {
		if (number_of_cyborgs == 1) {
			console.log("cyborgmain wins"); // DEBUG
			send_msg_to_team("cyborgmain", "win");
		} else if (number_of_cyborgs == 2) {
			console.log("cyborgmain shifumi"); // DEBUG
			send_msg_to_team("cyborgmain", "win");
			//TODO: call shifumi?
		} else {
			console.log("cyborgmain play again"); // DEBUG
			send_msg_to_team("cyborgmain", "play");
			//TODO: play again with cyborgmain team
		}
	} else {
		if (number_of_players - number_of_cyborgs == 1) {
			console.log("humain wins"); // DEBUG
			send_msg_to_team("humain", "win");
		} else if (number_of_players - number_of_cyborgs == 2) {
			console.log("humain shifumi"); // DEBUG
			send_msg_to_team("humain", "win");
			//TODO: call shifumi?
		} else {
			console.log("humain play again"); // DEBUG
			send_msg_to_team("humain", "play");
			//TODO: play again with humain team
		}
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

		//TODO: results.length???
		var results_length = 0;
		for (var unused in results) {
			results_length++;
		}

		//everybody played
		if (results_length === number_of_players) {
			check_results(socket);
		} else {
			socket.emit("status_update", "wait");
		}
	});

});


app.get("/",function (req,res,next) {
    res.render("cyborgmain_humain");
});

server.listen(4242);
