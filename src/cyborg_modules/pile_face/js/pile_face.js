'use strict';

let roomno = 1;

class Game_pile_or_face {

	joinRoom(io, socket) {
		socket.room = "room-"+roomno;
		socket.join("room-"+roomno);
		socket.choice = null;
		socket.score = 0;

		if(io.sockets.adapter.rooms["room-"+roomno] && io.sockets.adapter.rooms["room-"+roomno].length > 1)
		{
			socket.broadcast.to(socket.room).emit('message', "Choose pile or face!");
			socket.broadcast.to(socket.room).emit('your_score', "0");
			socket.broadcast.to(socket.room).emit('adversaire_score', "0");
			roomno++;
			socket.emit('message', "Guess pile or face!");
			socket.first = false;
		}
		else
		{
			socket.first = true;
			socket.emit('message', 'wait for your opponent!')
		}
	}

	check_results(first, seconde) {
		if (!first || !seconde) {
			return ;
		}
		if (first.choice == seconde.choice) {
			first.first = false;
			seconde.first = true;
			seconde.score++;
			seconde.emit('message', 'You win! Choose Pile or Face!');
			first.emit('message', 'You lost! Guess Pile or Face!');
		}
		else {
			first.score++;
			first.emit('message', 'You win! Choose Pile or Face!');
			seconde.emit('message', 'You lost! Guess Pile or Face!');
		}
		first.choice = null;
		seconde.choice = null;
		first.emit('your_score', first.score);
		first.emit('adversaire_score', seconde.score);
		seconde.emit('your_score', seconde.score);
		seconde.emit('adversaire_score', first.score);
		return ;
	}

	check_choice(io, socket, choice) {
		// console.log('check_choice');
		if (socket.choice == null) {
			socket.choice = choice;
			let first = null;
			let seconde = null;
			Object.keys(io.sockets.in(socket.room).sockets).forEach(function(id) {
				if (io.sockets.sockets[id].choice == null) {
					return ;
				}
				if (io.sockets.sockets[id].first == true) {
					first = io.sockets.sockets[id];
				}
				else {
					seconde = io.sockets.sockets[id];
				}

			});
			if (first && seconde) {
				this.check_results(first, seconde);
			}
		}
	}
};
module.exports = Game_pile_or_face;
