/*
*Lancer des jeux, gérer les ports
*Singleton
*Renvoie un identifiant de l'instance de jeu
*Renvoie l'url
*/

exports.startGame = startGame;
exports.stopGame = stopGame;

const ip = require("ip").address();
const child_process = require('child_process')
const net = require("net");
const path = require("path");

const INIT_PORT = 3000;
const RANGE_PORT = 100;
const PATH_CYB_MODS = path.join(__dirname,"../cyborg_modules/");
const MAX_PORT = INIT_PORT + RANGE_PORT;

var gamesProcess = [];

function startGame(name,arraySessions,callback) {
  _getPort(function (port,err) {
    if(err){
      throw err
    }
    var pathgame = path.join(PATH_CYB_MODS,name);
    console.log(pathgame)
    var child = child_process.fork(pathgame);
    var url = "http://"+ip+":"+port;

    var idgame = gamesProcess.push(child) - 1;

    callback(idgame,url)

    // child.on('message', (m) => {
    //   if(m.state === "READY"){
    //     callback(idgame,url)
    //   }
    // });
    //
    // child.on('message', (m) => {
    //   if(m.state === "KILLME"){
    //     stopGame(idgame);
    //   }
    // });

  })
}

function stopGame(idGame) {
  var child = gamesProcess[idGame];
  if(child){
    gamesProcess[idGame].kill("SIGKILL");
    gamesProcess.splice(idGame, 1);
  }
}

function _isPortAvailble(port,callback) {

  var testServer = net.createServer();

  testServer.on('error', (err) => {
    testServer.close();
    callback(false);
  });

  testServer.on('listening', (err) => {
    testServer.close();
    callback(true)
  });

  testServer.listen(port);
}

// Callback (portAvailable, err)
function _getPort (callback) {

  var i = 0;
  i++;
  
  function nextPort() {
    var portToTest = INIT_PORT + i;
    if(portToTest < MAX_PORT ){
      _isPortAvailble(portToTest,function (isAvaible) {
        if(isAvaible){
          callback(portToTest,null)
        }else {

          nextPort();
        }
      })
    }else{
      callback(null,"out of range")
    }
  }
  nextPort();
}

// startGame("pfc",[],function (idGame,url) {
//   // stopGame(idGame)
// })
