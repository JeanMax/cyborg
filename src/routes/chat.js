var express = require('express')
var router = express.Router()
var chat = require('../lib/chat.js');

router.all('*',function (req,res,next) {
	let io = req.app.get('sio');

	let players = req.app.get('players');
	let suid = req.session.suid;

	let socket = players[suid].socket;

	chat.initSocketChat(io, socket);
	res.render('chat',{
  	messagesList:chat.getMessagesList()
    });
});

module.exports = router
