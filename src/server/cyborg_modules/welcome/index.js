var express = require('express')
var app = express();
var server = require('http').Server(app);
var path = require("path");

app.use('/static',express.static('client/static/'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/client'));



app.get('/welcome',function (req,res,next) {
    res.render('welcome');
});

app.get('/chooseGame',function (req,res,next) {

  var games = AllGames.games;
  res.render('chooseGame',{games:games});
});

app.get('/newGame',function (req,res,next) {
  // TODO Refaire :)
  var idGame = req.query.name.toString().trim();
  var picked = AllGames.games.find(function (game) {
    return game.id == idGame;
  });
  var gameName = picked.name;

  res.render("waitforplayer",{title:gameName})
});

server.listen(3001);
