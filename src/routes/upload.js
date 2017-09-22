const express = require('express')
const router = express.Router()
const fs = require('fs');
const getSize = require('get-folder-size');
const child_process = require('child_process');
const CYBORG_MODULES_PATH = 'cyborg_modules/';
const MAX_SIZE_CYBORG_MODULES = 10000000;
const CONFIG_FILE = 'cyborg-config.json';

var Files = {};


function readFile(file_path){

		try{
			if (fs.existsSync(file_path)){
				return JSON.parse(fs.readFileSync(file_path, 'utf8'));
			}
		}catch(e) {console.log(e);}
		return null;
}

function addGame(dir_name, path_file, data) {

	let newGame = null;
	if (data)
	{
		try {
			newGame = JSON.parse(data);
		} catch (e) {
			console.log('Error json parse: ', e);
			return ;
		}
	}

	if (!newGame || !newGame.config || !newGame.config.name || !newGame.config.main) {
		console.log('Need: ', CONFIG_FILE);
		return ;
	}
	newGame = newGame.config;

	let config_game = reqApp.get('config');

	if (config_game) {
		config_game.games[dir_name] = {};
		config_game.games[dir_name].name = newGame.name;
		config_game.games[dir_name].path = './'+dir_name +'/'+ newGame.main;
		fs.writeFile(CONFIG_FILE, JSON.stringify(config_game), function (err) {
			if (err) return console.log(err);
			reqApp.set('config', config_game);
		});
	}

}

function rmDir (socket, dir, arr_dir) {
	if (socket.initStart == true || !socket.dowload || !socket.dowload.folder == dir + arr_dir[0]) {
		if (fs.existsSync(CYBORG_MODULES_PATH  + arr_dir[0])) {
			child_process.exec('rm -rf ' + CYBORG_MODULES_PATH  + arr_dir[0], (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
				}
				if (stdout) {
					console.log(`stdout: ${stdout}`);
				}
				if (stderr) {
					console.log(`stderr: ${stderr}`);
				}
			} );
			socket.initStart = false;
			socket.dowload = {};
			socket.dowload.folder = dir + arr_dir[0];
		}
		socket.emit('initOk');
	}
	else{
		socket.emit('initOk');
	}
}
var reqApp;
router.all('*',function (req,res,next) {
	let io = req.app.get('sio');
	reqApp = req.app;
	let players = req.app.get('players');
	let suid = req.session.suid;

	let socket = players[suid].socket;
	// io.on('connection', function (socket, pseudo) {
		socket.dowload = null;
		socket.initStart = false;

		socket.on('initStart', function () {
			socket.dowload = null;
			socket.initStart = true;
		});
		socket.on('init', function (data) {
			Files = {};
			let name = data['Name'];
			let arr_dir = name.split('/');
			let dir = CYBORG_MODULES_PATH;
			rmDir (socket, dir, arr_dir);

		});

		socket.on('Start', function (data) {
			let Name = data['Name'];
			let arr_dir = Name.split('/');
			let dir = CYBORG_MODULES_PATH;

			let Place = 0;
			try{
				if (!fs.existsSync(dir)){
					fs.mkdirSync(dir);
				}
			}catch(e) {console.log(e);}


			Files[Name] = {
				FileSize : data['Size'],
					Data : "",
				Downloaded : 0
			}


			getSize(dir, function(err, size) {
				if (err) { return ; }
				if (size + data['Size'] > MAX_SIZE_CYBORG_MODULES) {
					socket.emit('message', 'Folder too big!');
					console.log('Limit size reached');
					child_process.exec('rm -rf ' + CYBORG_MODULES_PATH + '/' + arr_dir[0]);
					return ;
				}
				try{

					if (arr_dir.length) {
						for (var i = 0; i < arr_dir.length -1; i++) {
							dir += arr_dir[i] + '/';
							if (!fs.existsSync(dir)){
								fs.mkdirSync(dir);
							}
						}
					}


					if (fs.existsSync(CYBORG_MODULES_PATH +  Name)) {
						var Stat = fs.statSync(CYBORG_MODULES_PATH +  Name);
						if(Stat && Stat.isFile())
						{
							Files[Name]['Downloaded'] = Stat.size;
							Place = Stat.size / 524288;
						}
					}
				}
				catch(er){console.log(er);};


				fs.open(CYBORG_MODULES_PATH + Name, "a", 0777, function(err, fd){
					if(err)
					{
						console.log('err:',err);
					}
					else
					{
						Files[Name]['Handler'] = fd;
						socket.emit('MoreData', { 'Place' : Place, Percent : 0, 'File_name': arr_dir[arr_dir.length -1]});
					}
				});
			});

		});

		socket.on('Upload', function (data){
			let Name = data['Name'];

			Files[Name]['Downloaded'] += data['Data'].length;
			Files[Name]['Data'] += data['Data'];
			if(Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
			{

				fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
					if (err) {
						console.log(err);
					}

					fs.close(Files[Name]['Handler']);
					let file_path = './'+ CYBORG_MODULES_PATH + Name;
					let arr_name = data['Name'].split('/');
					let dir_name = arr_name[0];
					let last_name = arr_name[arr_name.length - 1];

					if (last_name == 'load.json') {
						addGame(dir_name, file_path, data['Data']);
					}

					let Place = Files[Name]['Downloaded'] / 524288;
					let Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
					socket.emit('FinishDownload', { 'Place' : Place, 'Percent' :  Percent});
					socket.emit('MoreFiles', { 'Place' : Place, 'Percent' :  Percent});
				});

			}
			else if(Files[Name]['Data'].length > 10485760){ //If the Data Buffer reaches 10MB

				fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
					Files[Name]['Data'] = ""; //Reset The Buffer
					let Place = Files[Name]['Downloaded'] / 524288;
					let Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
					socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
				});
			}
			else
			{
				var Place = Files[Name]['Downloaded'] / 524288;
				var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
				socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
			}
		});

	players[suid].socket = socket;
	// });
	res.render('upload_dir.ejs');
});

module.exports = router
