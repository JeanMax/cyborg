var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cookieSession = require('cookie-session');
var cookielib = require('cookie');
var bodyParser = require('body-parser');

var usersConnected = [];

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


app.post('/choix',function (req,res,next) {
  var newPlayerName = req.body.playerName;
  if(!req.session.playerName){
    req.session.playerName = newPlayerName;
    res.cookie('cyborgPlayerName', newPlayerName)
  }
  var playerName = req.session.playerName;
  res.render('choix', { playerName: playerName });
  // res.sendFile(__dirname+'/client/choix.html');
});


app.use('/',express.static('client'));


server.listen(8080);


io.on('connection',function (socketClient) {

  var strCookies = socketClient.handshake.headers.cookie;
  var cookies = cookielib.parse(strCookies);
  var playerName = cookies.cyborgPlayerName;

  if(!playerName){
    console.log("Un nouveau joueur se présente");
  }

  if(playerName && usersConnected.indexOf(playerName) == -1){
    usersConnected.push(playerName);
    console.log("Bienvenue " +playerName);
  }

  if(playerName && usersConnected.indexOf(playerName) != -1){
    console.log("Bienvenue " +playerName);
  }


  // console.log(strCookies);
  // if(!cookies.cyborg){
  //   console.log("bienvenue");
  // }else {
  //   console.log("rebonjour");
  // }

  socketClient.on('disconnect', function () {
    console.log()
  });
});
