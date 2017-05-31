/*
*Lancer des jeux, gérer les ports
*Singleton
*Renvoie un identifiant de l'instance de jeu
*Renvoie l'url
*/

exports.startGame = startGame;
exports.stopGame = stopGame;
exports.getGameInstances = getGameInstances;


const ip = require("ip").address();
const child_process = require('child_process')
const net = require("net");
const path = require("path");

const INIT_PORT = 3000;
const RANGE_PORT = 100;
const PATH_CYB_MODS = path.join(__dirname,"../cyborg_modules/");
const MAX_PORT = INIT_PORT + RANGE_PORT;

var gamesProcess = [];

function startGame(name,suidList,callback) {
  _getPort(INIT_PORT,function (port,err) {
    if(err){
      throw err
    }
    var pathgame = path.join(PATH_CYB_MODS,name);
    var args = ["-p",port].concat(suidList);

    var child = child_process.fork(pathgame,args);
    var url = "http://"+ip+":"+port;

    // La fonction push renvoi la longueur de la liste et non la position
    var length = gamesProcess.push({
      prog: child,
      name : name,
      url : url
    });


    child.on('message', (m) => {
      if(m.state === "READY"){
        callback(length - 1,url,child)
      }
    });

    child.on('message', (m) => {
      if(m.state === "FINISH"){
        stopGame(length - 1);
      }
    });

  })
}

function stopGame(idGame) {
  var child = gamesProcess[idGame].prog;
  if(child){
    child.kill("SIGKILL");
    gamesProcess.splice(idGame, 1);
  }
}

function getGameInstances() {
  return gamesProcess.map(function (g) {
    var name = g.name;
    var url = g.url;
    return {name:name,url:url};
  })
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
// TODO: Refaire !!!
function _getPort (port,callback) {

  _isPortAvailble(port,function (isAvaible) {
    if(isAvaible){
      callback(port,null)
    }else {
      _getPort(port+1,callback);
    }
  })



  // function nextPort() {
  //   i++;
  //   var portToTest = INIT_PORT + i;
  //   if(portToTest < MAX_PORT ){
  //     _isPortAvailble(portToTest,function (isAvaible) {
  //       if(isAvaible){
  //         callback(portToTest,null)
  //       }else {
  //         nextPort();
  //       }
  //     })
  //   }else{
  //     callback(null,"out of range")
  //   }
  // }
  // nextPort();
}

// startGame("pfc",[],function (idGame,url) {
//   // stopGame(idGame)
// })
