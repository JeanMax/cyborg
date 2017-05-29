const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const ip = require("ip").address();

var welcome = require('./welcome')
var initPort = 3000;


var child = require('child_process').fork('./cyborg_modules/pfc/index.js');


// Repertoire contenant les vues, ainsi que les assets clients accessible par tous.
app.set('views', __dirname+'/client/views');
app.use('/static',express.static('client/static/'));

app.set('view engine', 'ejs')

//Template cyborg
app.get('/',function (req,res,next) {
  res.render('cyborg');
});

//Welcome route
app.use("/welcome",welcome);


//Singleton welcome application d'acceuil
/*
* Recupere les informations sur le joueur (nom)
* Propose de créer et de rejoindre une partie
*/

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
