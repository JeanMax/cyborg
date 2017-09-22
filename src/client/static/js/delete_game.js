function deleteInit(idGame, nameGame){
	console.log('idGame:',idGame);
	let content = '<div><span>Delete '+nameGame+' ? </span></br>';
	content += "<span onclick=cancel(\'" + idGame + "\')>Cancel</span> ";
	content += "<a href='/deleteGame/delete/"+idGame+"' >Hans ! </a> </div>";

	document.getElementById('deleteArea-'+idGame).innerHTML	 = content;

	document.getElementById('deleteInit-'+idGame).style.display = 'none';
}

function cancel(idGame) {
	document.getElementById('deleteArea-'+idGame).innerHTML = '';

	document.getElementById('deleteInit-'+idGame).style.display = 'block';

}
