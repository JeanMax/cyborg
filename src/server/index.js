var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cookieSession = require('cookie-session');
var cookielib = require('cookie');
var bodyParser = require('body-parser');
var platform = require('./lib/platform.js')();


app.set('views', __dirname+'/client');
app.set('view engine', 'ejs');

app.use('/static',express.static('client/assets/'));

app.use(cookieSession({
  name: 'session',
  keys: ['randomSecretKey'],

  // Cookie Options
  maxAge:  30 * 60 * 1000 // 30 min
}));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


app.post('/changeName',function (req,res,next) {
  var newPlayerName = req.body.cyborgPlayerName;

  //Si l'utilisateur n'est pas encore indexé sur la platform
  if(!req.session.cyborgPlayerName){
    platform.ajouterJoueur(newPlayerName);
  }else{
    var oldName = req.session.cyborgPlayerName;
    var joueur = platform.recupererJoueur(oldName);
    joueur.name(newPlayerName);
  }

  req.session.cyborgPlayerName = newPlayerName;
  res.cookie('cyborgPlayerName', newPlayerName)

  res.render('choix', { playerName: newPlayerName });

});

app.post('/chooseGame',function (req,res,next) {
  var newPlayerGame = req.body.cyborgPlayerGame;
  var playerName = req.session.cyborgPlayerName;
  var joueur = platform.recupererJoueur(playerName);

  if(!joueur){
    res.render('name');
  }else{
    joueur.game(newPlayerGame);
    req.session.cyborgPlayerGame = newPlayerGame;
    res.cookie('cyborgPlayerGame', newPlayerGame);
    res.render('newgame');
  }

});


app.use('/',function (req,res,next) {

  var cyborgPlayerName = req.session.cyborgPlayerName;
  var cyborgPlayerGame = req.session.cyborgPlayerGame;

  var joueur = platform.recupererJoueur(cyborgPlayerName);

  if(!joueur && cyborgPlayerName){
    joueur = platform.ajouterJoueur(cyborgPlayerName);
  }

  if(!joueur || !joueur.hasName()){
    res.render('name');
  }else if(!joueur.hasGame()){
    var name = joueur.name();
    res.render('choix', { playerName: name});
  }else {
    res.render('newgame');
  }

});


server.listen(80);

//
io.on('connection',function (socketClient) {

  var strCookies = socketClient.handshake.headers.cookie || "";
  var cookies = cookielib.parse(strCookies);
  var playerName = cookies.cyborgPlayerName;
  var playerGame = cookies.cyborgPlayerGame;

  if(playerName){
    console.log("Bonjour " + playerName);
  }
  //
  // if(playerName && usersConnected.indexOf(playerName) == -1){
  //   usersConnected.push(playerName);
  //   console.log("Bienvenue " +playerName);
  // }
  //
  // if(playerName && usersConnected.indexOf(playerName) != -1){
  //   console.log("Bienvenue " +playerName);
  // }


  // console.log(strCookies);
  // if(!cookies.cyborg){
  //   console.log("bienvenue");
  // }else {
  //   console.log("rebonjour");
  // }

  socketClient.on('disconnect', function () {
    if(playerName){
      console.log("Aurevoir " + playerName);
    }
  });
});
