window.addEventListener("load", Ready);
var cyborg = window.parent.cyborg;
var socket = cyborg.socket;

var SelectedFile = null;
var SelectedFiles = null;
var Name = null;
var i = 0;
var len = null;
function Ready(){
	if(window.File && window.FileReader){ //These are the relevant HTML5 objects that we are going to use
		document.getElementById('UploadButton').addEventListener('click', init);
		document.getElementById('FileBox').addEventListener('change', FileChosen);
		document.getElementById('FileBox').addEventListener('click', FileChosen);
	}
	else
	{
		document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
	}

	function FileChosen(evnt) {
		SelectedFiles = evnt.target.files;
		i = 0;
		len = 0;
		let dir = '';
		if (!SelectedFiles || !SelectedFiles.length) {
			return;
		}

		len = SelectedFiles.length;
		dir = evnt.target.files[0].webkitRelativePath.split('/');


		document.getElementById('NameBox').value = dir[0];
	}
}
function init() {
	let selected = SelectedFiles[i];
	let name = selected.webkitRelativePath;
	socket.emit('init', {'Name': name});
}
function initStart() {
	socket.emit('initStart');
}

function StartUpload(){
	if(i || document.getElementById('FileBox').value != "")
	{
		SelectedFile = SelectedFiles[i];
		if (!SelectedFile) {
			return ;
		}

		Name = SelectedFile.webkitRelativePath;

		let Content = '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">0%</span>';
		Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>";
		document.getElementById('UploadArea').innerHTML = Content;

		socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
	}
	else
	{
		alert("Please Select A File");
	}
}

socket.on('initOk', function() {
	StartUpload();
});

socket.on('MoreFiles', function() {
	i++;
	if (i < len){
		StartUpload();
	}
	else {
		socket.emit('initStart');
		document.getElementById('UploadArea').innerHTML = '';
	}
})

socket.on('MoreData', function (data){
	UpdateBar(data['Percent']);
	var Place = data['Place'] * 524288; //The Next Blocks Starting Position
	var NewFile = null; //The Variable that will hold the new Block of Data
	SelectedFile = SelectedFiles[i];
	if (!SelectedFile) {
		return ;
	}
	let FReaderBis = new FileReader();
	let Name = SelectedFile.webkitRelativePath;
	FReaderBis.onload = function(evnt){
		if (evnt.loaded > 0) {
			socket.emit('Upload', { 'Name' : Name, Data : evnt.target.result });
		}
	}
	if(SelectedFile.webkitSlice)
		NewFile = SelectedFile.webkitSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
	else
		NewFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));

	if (data['File_name'] == 'load.json') {

		FReaderBis.readAsText(NewFile);
	}
	else {
		FReaderBis.readAsBinaryString(NewFile);
	}
});

socket.on('FinishDownload', function (data) {
	UpdateBar(data['Percent']);

	let content = "<span >";
	content += "<label for='FileBox'>Choose A folder: </label>";
	content += "<input type='file' id='FileBox' webkitdirectory directory multiple><br>";
	content += "<label for='NameBox'>Name: </label><input type='text' id='NameBox'><br>";
	content += "<button  type='button' id='UploadButton' class='Button'>Upload</button>";
	content += "</span>";
	document.getElementById('UploadAreaForm').innerHTML = content;
	Ready();
})
function UpdateBar(percent){
	if (!document.getElementById('ProgressBar')) {
		return;
	}
	document.getElementById('ProgressBar').style.width = percent + '%';
	document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%';
	var MBDone = Math.round(((percent/100.0) * SelectedFile.size) / 1048576);
	document.getElementById('MB').innerHTML = MBDone;
}
