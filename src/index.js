var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var http = require('http');

var httpProxy = require('http-proxy');
var cyborgConfig = require('./cyborg-config.json');
var welcome = require('./cyborg_modules/'+cyborgConfig.main.name);
var courtePaille = require('./cyborg_modules/courte-paille/index.js');
var initPort = 3000;
var apiProxy = httpProxy.createProxyServer({ws:true});

// Start welcome app
cyborgConfig.io = io;
cyborgConfig.main.port = initPort;
welcome.start(cyborgConfig);

initPort += 1;
cyborgConfig.port = initPort;
courtePaille.start(cyborgConfig);

// Repertoire contenant les vues, ainsi que les assets clients accessible par tous.
app.set('views', __dirname+'/client');
app.use('/static',express.static('client/static/'));

app.get('/',function (req,res,next) {
  res.sendFile(__dirname+'/client/cyborg.html');
});

//Singleton welcome application d'acceuil
/*
* Recupere les informations sur le joueur (nom)
* Propose de créer et de rejoindre une partie
*/
app.all("/welcome/*", function(req, res){
  // req.url = req.url.replace("/"+cyborgConfig.main.name, "");
  // var urlTarget = "http://localhost:"+cyborgConfig.main.port+"/";
  // apiProxy.web(req, res, { target: urlTarget });
});

//Lancement d'un nouveau jeu
/*
* Creation d'un instance de ce jeu, avec un id (gameId)
*/
app.get("/new/:gameName", function(req, res){
  // req.url = req.url.replace("/"+cyborgConfig.main.name, "");
  // var urlTarget = "http://localhost:"+cyborgConfig.main.port+"/";
  // apiProxy.web(req, res, { target: urlTarget });
});


//Lancement d'un nouveau jeu
/*
* Redirection vers le jeu ayant l'id gameId
*/
app.all("/game/:gameId/*", function(req, res){
  // req.url = req.url.replace("/game", "");
  // var urlTarget = "http://localhost:"+cyborgConfig.port+"/";
  // apiProxy.web(req, res, { target: urlTarget });
});

// app.all("/game/*", function(req, res){
//   req.url = req.url.replace("/game", "");
//   var urlTarget = "http://localhost:"+cyborgConfig.port+"/";
//   apiProxy.web(req, res, { target: urlTarget });
// });

server.listen(8080);

io.on('connection',function (socketClient) {
  io.emit("numberOfPlayer",io.engine.clientsCount)

  socketClient.on('newName', function (nom) {
    socketClient.broadcast.emit('annonce', nom + " est connecté");
  });

  socketClient.on('changeName', function (nameObj) {
    socketClient.broadcast.emit('annonce',nameObj.old + " a changé son nom en "+ nameObj.new);
  });

  socketClient.on('disconnect', function () {
    socketClient.broadcast.emit("Un joueur s'est déconnecté :(");
    io.emit("numberOfPlayer",io.engine.clientsCount)
  });
});


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
