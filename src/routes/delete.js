const express = require('express')
const router = express.Router()
const fs = require('fs');
const getSize = require('get-folder-size');
const child_process = require('child_process');
const CYBORG_MODULES_PATH = 'cyborg_modules/';
const CONFIG_FILE = 'cyborg-config.json';

router.get('/delete/:gameName',function (req,res,next) {
	let gameName = req.params.gameName.toString().trim();

	let config_game = req.app.get('config');
	if (config_game.games[gameName]) {
		let path = CYBORG_MODULES_PATH + config_game.games[gameName].path.split('/')[1];
		if (fs.existsSync(path)) {
			child_process.exec('rm -rf ' + path, (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return ;
				}
				if (stdout) {
					console.log(`stdout: ${stdout}`);
				}
				if (stderr) {
					console.log(`stderr: ${stderr}`);
				}

				config_game.games[gameName] = null;
				delete config_game.games[gameName];
				fs.writeFile(CONFIG_FILE, JSON.stringify(config_game), function (err) {
					if (err) return console.log(err);
					req.app.set('config', config_game);
				});
			} );

	}

	}
	res.redirect('/welcome/games');
});

module.exports = router
