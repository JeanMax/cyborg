const express = require('express')
const app = express();
const server = require('http').Server(app);
const sio = require('socket.io')(server);
const session = require("express-session");

const welcome = require('./routes/welcome');
const game = require('./routes/games');
const settings = require('./routes/settings');
const chat = require('./routes/chat');

var joueurs = {};
var suid = 0;

// On accéde à config dans les autre fichiers routes grace à req.app.get('config')
var cyborgConfig = require('./cyborg-config.json');
app.set('config', cyborgConfig);

// Repertoire contenant les vues, ainsi que les assets clients accessible par tous.
app.set('views', __dirname+'/client/views');
app.use('/static',express.static('client/static/'));

// Utilisation du moteur de rendu ejs
app.set('view engine', 'ejs')

// Session -->
// On peut aussi mettre l'accés à une base de données
// https://stackoverflow.com/questions/25532692/how-to-share-sessions-with-socket-io-1-x-and-express-4-x
// var secret = cyborgConfig.secret_session;

var sessionMiddleware = session({
    secret: "cyborg"
});

// Session dans les sockets
sio.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

// Session dans les requetes
app.use(sessionMiddleware);

// <-- Session

//access socket io in routes files
app.set('sio', sio);
app.set('players', {});


//Template cyborg
app.get('/',function (req,res,next) {
  // On assigne un suid à la première connection
  if(!req.session.suid){
    suid++;
    var mySuid = suid;
    var players = app.get('players');
    req.session.suid = mySuid;
    players[mySuid] = {};
  }
  // On retourne la page de garde
  res.render('cyborg');
});

//Welcome route
//Create or access your profil, select a game, wait for game begin
app.use("/welcome",welcome);

//games route
//Start, Kill, Pause, Save game
app.use("/game",game);

//games route
//Config your reachable peripheral devices, ex: volume of sound, connected devices, ect...
app.use("/settings",settings);

//chat route
//Chat with other players, games can settings chat rooms
app.use("/chat",chat);


server.listen(8080);


sio.on('connection',function (socketClient) {
  // console.log(socketClient.request.session)
  var players = app.get('players');
  var mySuid = socketClient.request.session.suid;

  players[mySuid].socket = socketClient;

  sio.emit("numberOfPlayer",sio.engine.clientsCount)

  socketClient.on('newName', function (nom) {
    socketClient.broadcast.emit('annonce', nom + " est connecté");
  });

  socketClient.on('changeName', function (nameObj) {
    socketClient.broadcast.emit('annonce',nameObj.old + " a changé son nom en "+ nameObj.new);
  });

  socketClient.on('disconnect', function () {
    socketClient.broadcast.emit("Un joueur s'est déconnecté :(");
    sio.emit("numberOfPlayer",sio.engine.clientsCount)
  });
});


//Lancement d'un nouveau jeu
/*
* Redirection vers le jeu ayant l'id gameId
*/
// app.all("/game/:gameId/*", function(req, res){
//   // req.url = req.url.replace("/game", "");
//   // var urlTarget = "http://localhost:"+cyborgConfig.port+"/";
//   // apiProxy.web(req, res, { target: urlTarget });
// });

// app.all("/game/*", function(req, res){
//   req.url = req.url.replace("/game", "");
//   var urlTarget = "http://localhost:"+cyborgConfig.port+"/";
//   apiProxy.web(req, res, { target: urlTarget });
// });

// app.get('/welcome',function (req,res,next) {
//   res.sendFile(__dirname+'/client/welcome.html');
// });
//
// app.get('/chooseGame',function (req,res,next) {
//
//   var games = AllGames.games;
//   res.render('chooseGame',{games:games});
// });
//
// app.get('/newGame',function (req,res,next) {
//   // TODO Refaire :)
//   var idGame = req.query.name.toString().trim();
//   var picked = AllGames.games.find(function (game) {
//     return game.id == idGame;
//   });
//   var gameName = picked.name;
//
//   res.render("waitforplayer",{title:gameName})
// });

// app.get('/chooseGame',function (req,res,next) {
//   console.log(games);
//   res.sendFile(__dirname+'/client/chooseGame.html');
// });



// app.use('/*',function (req,res,next) {
//   res.sendFile(__dirname+'/client/'+'index.html');
// });


// app.post('/changeName',function (req,res,next) {
//   var newPlayerName = req.body.cyborgPlayerName;
//
//   //Si l'utilisateur n'est pas encore indexé sur la platform
//   if(!req.session.cyborgPlayerName){
//     platform.ajouterJoueur(newPlayerName);
//   }else{
//     var oldName = req.session.cyborgPlayerName;
//     var joueur = platform.recupererJoueur(oldName);
//     joueur.name(newPlayerName);
//   }
//
//   req.session.cyborgPlayerName = newPlayerName;
//   res.cookie('cyborgPlayerName', newPlayerName)
//
//   res.render('choix', { playerName: newPlayerName });
//
// });
//
// app.post('/chooseGame',function (req,res,next) {
//   var newPlayerGame = req.body.cyborgPlayerGame;
//   var playerName = req.session.cyborgPlayerName;
//   var joueur = platform.recupererJoueur(playerName);
//
//   if(!joueur){
//     res.render('name');
//   }else{
//     joueur.game(newPlayerGame);
//     req.session.cyborgPlayerGame = newPlayerGame;
//     res.cookie('cyborgPlayerGame', newPlayerGame);
//     res.render('newgame');
//   }
//
// });
//
//
// app.use('/',function (req,res,next) {
//
//   var cyborgPlayerName = req.session.cyborgPlayerName;
//   var cyborgPlayerGame = req.session.cyborgPlayerGame;
//
//   var joueur = platform.recupererJoueur(cyborgPlayerName);
//
//   if(!joueur && cyborgPlayerName){
//     joueur = platform.ajouterJoueur(cyborgPlayerName);
//   }
//
//   if(!joueur || !joueur.hasName()){
//     res.render('name');
//   }else if(!joueur.hasGame()){
//     var name = joueur.name();
//     res.render('choix', { playerName: name});
//   }else {
//     res.render('newgame');
//   }
//
// });
