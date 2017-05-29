
var express = require('express')
var router = express.Router()
var path = require("path");
const ip = require("ip").address();

var cyborgConfig = require('./cyborg-config.json');

router.get('/home',function (req,res,next) {
    res.render('welcome');
});

router.get('/chooseGame',function (req,res,next) {
  var games = cyborgConfig.games;
  res.render('chooseGame',{games:games});
});

router.get('/newGame',function (req,res,next) {
  // TODO Refaire :)
  var idGame = req.query.name.toString().trim();
  var picked = cyborgConfig.games.find(function (game) {
    return game.id == idGame;
  });
  var gameName = picked.name;
  var uriGame = "http://"+ip+":3001";
  res.render("waitforplayer",{
    title:gameName,
    uriGame: uriGame
  });
});



  // cyborgConfig.io.on('connection',function (socketClient) {
  //   socketClient.on('newName', function (nom) {
  //     console.log("Bonjour "+nom)
  //   });
  // });


module.exports = router
