let cyborg = window.parent.cyborg;
const socket = cyborg.socket;
let author = cyborg.name;

$('#Send').click(function () {
	let content = document.getElementById('text-area-chat').value;
	if (!content.length) {
		return;
	}
	socket.emit('Send', {author: author, content: content});
	document.getElementById('text-area-chat').value = null;

})

function scrollMessage(container) {
	let scrollPosition = container.scrollTop === 0 ? container.scrollHeight : 0;
	window.scrollTo(0, scrollPosition + 50);
}

socket.on('newMessage', function (newMessage) {
	let container = document.getElementById('container-message');
	container.innerHTML += newMessage;
	scrollMessage(container);
})

scrollMessage(document.getElementById('container-message'));
