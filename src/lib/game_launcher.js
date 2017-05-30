/*
*Lancer des jeux, gérer les ports
*Singleton
*Renvoie un identifiant de l'instance de jeu
*Renvoie l'url
*/


const ip = require("ip").address();
const testServer = require("net").createServer();

const INIT_PORT = 3;
const RANGE_PORT = 10;

/*
* Renvoie un numéro de port comprit dans la range si il est disponible
*
*/
function _getPort() {

  var port = INIT_PORT;
  var i = 0;
  var find = false;
  var actualPort ;

  while (i < RANGE_PORT ) {
    availablePort = INIT_PORT + i;
    console.log(availablePort);

    try {
      testServer.listen(availablePort);
      console.log("OK");
    } catch (e) {
      console.error(e);
    } finally {

    }

    i ++;

  }


}

_getPort();

// var child = require('child_process').fork('./cyborg_modules/pfc/index.js');
