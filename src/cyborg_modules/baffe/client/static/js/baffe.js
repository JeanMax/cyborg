"use strict";

var me, players,
	status_dic = {
		"win": "Vous avez gagné!",
		"loose": "Vous avez perdu!",
		"wait": "En attente des autres joueurs...",
		"play": "Baffez un joueur"
	},
	socket = io();


function interact(action, player_id) {
	socket.emit(action, player_id);
}


function init_players(number_of_players, initial_life) {
	function create_button(action, target) {
		var new_button = document.createElement('button');

		new_button.className = action;
		new_button.innerHTML = action;
		new_button.onclick = function () {
			interact(action, target);
		};

		return new_button;
	}

	function create_progress(max, player_id) {
		var new_progress = document.createElement('progress');

		new_progress.className = "life";
		new_progress.id = "life" + player_id;
		new_progress.value = max;
		new_progress.max = max;

		return new_progress;
	}

	function create_player_div(player_id) {

		var new_div = document.createElement('div');

		new_div.className = "player";
		new_div.id = "player" + player_id;
		new_div.innerHTML = "player" + player_id; //TODO
		new_div.appendChild(document.createElement('br'));

		new_div.appendChild(create_button("baffe", player_id));
		new_div.appendChild(create_progress(initial_life, player_id));
		new_div.appendChild(create_button("soin", player_id));

		return new_div;
	}

	var players_div = document.getElementById("players");

	while (number_of_players--) {
		players_div.appendChild(
			create_player_div(number_of_players)
		);
	}
}


function update_game(msg) {
	msg = JSON.parse(msg);

	document.getElementById("status").innerHTML = status_dic[msg.status];

	if (!players) {
		init_players(msg.players.length, msg.players[0].life);
		document.getElementById("info").innerHTML = "(Vous êtes player" + msg.client_id + ")";
	} else {
		for (var i = 0; i < players.length; i++) {
			if (msg.players[i].life !== players[i].life) {
				document.getElementById("life" + i).value = msg.players[i].life;
			}
		}
	}

	players = msg.players;
	me = players[msg.client_id];
}


document.getElementById("status").innerHTML = status_dic["wait"];
socket.emit("init", 42);
socket.on("status_update", update_game);
