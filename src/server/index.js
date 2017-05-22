var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var http = require('http');

var httpProxy = require('http-proxy');

var apiProxy = httpProxy.createProxyServer();


var cyborgConfig = require('./cyborg-config.json');
const exec = require('child_process').exec;

app.set('views', __dirname+'/client');
app.use('/static',express.static('client/static/'));


app.get('/',function (req,res,next) {
  exec('cd ./cyborg_modules/welcome; node index.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });

  res.sendFile(__dirname+'/client/cyborg.html');
});

// app.get("/welcome/:url", function(req, res){
//   req.url = req.params.url;
//   console.log(req.url)
//   console.log(req.originalUrl);
//   apiProxy.web(req, res, { target: "http://localhost:3001/" });
// });

app.get("/welcome/*", function(req, res){
  console.log(req.url)
  console.log(req.originalUrl);
  apiProxy.web(req, res, { target: "http://localhost:3001/" });
});




// app.get('/welcome/:path', function(req, res,next) {
//   var path = '/'+ req.params.path;
//   console.log(path)
//   var options = {
//     // host to forward to
//     host:   'localhost',
//     // port to forward to
//     port:   3001,
//     // path to forward to
//     path:   path,
//     // request method
//     method: 'GET',
//     // headers to send
//     headers: req.headers
//   };
//
//   var creq = http.request(options, function(cres) {
//
//     // set encoding
//     cres.setEncoding('utf8');
//
//     // wait for data
//     cres.on('data', function(chunk){
//       res.write(chunk);
//     });
//
//     cres.on('close', function(){
//       // closed, let's end client request as well
//       res.writeHead(cres.statusCode);
//       res.end();
//     });
//
//     cres.on('end', function(){
//       // finished, let's finish client request as well
//       // res.writeHead(cres.statusCode);
//       res.end();
//     });
//
//   }).on('error', function(e) {
//     // we got an error, return 500 error to client and log error
//     console.log(e.message);
//     res.writeHead(500);
//     res.end();
//   });
//
//   creq.end();
//
// });


server.listen(8080);

//
io.on('connection',function (socketClient) {
  io.emit("numberOfPlayer",io.engine.clientsCount)
  //console.log("Un nouveau joueur s'est connecté :)");

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
