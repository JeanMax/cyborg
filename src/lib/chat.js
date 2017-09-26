exports.initSocketChat = initSocketChat;
exports.getMessagesList = getMessagesList;

const ejs = require('ejs');
const fs = require('fs');

const NB_MAX_MESSAGES_SESSION = 100;

let template = ejs.compile(fs.readFileSync(__dirname + '/../client/views/chat_message.ejs', 'utf8'));
let messages_list = [];

function initSocketChat(io, socket) {
	if (!socket) {
		return ;
	}
	socket.on('Send', function(data){
		let template_tmp = template({message: {author:data.author, content:data.content} });
		if (messages_list.length > NB_MAX_MESSAGES_SESSION) {
			messages_list.shift();
		}
		messages_list.push(template_tmp);
		// io.sockets.emit('newMessage', template_tmp);
		socket.emit('newMessage', template_tmp);
		socket.broadcast.emit('newMessage', template_tmp);
	})
}

function getMessagesList() {
	return messages_list;
}
