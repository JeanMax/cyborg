
var express = require('express')
var router = express.Router()

var gameLib = require('../lib/game_launcher.js');

router.get('/home',function (req,res,next) {
    res.render('welcome');
});

router.get('/chooseGame',function (req,res,next) {
  var allGames = req.app.get('config').games;
  var instanceGames = gameLib.getGameInstances();

  for (instanceGame of instanceGames) {
    instanceGame.url = instanceGame.url +"?suid="+req.session.suid;
  }

  res.render('chooseGame',{
    allGames: allGames,
    instanceGames: instanceGames
  });
});

router.get('/new/:gameName',function (req,res,next) {

    var gameName = req.params.gameName.toString().trim();

    console.error("------------------------------------------")
    console.error("ATTETION NOMBRE DE JOUEUR ECRIT EN DUR !!!")
    console.error("------------------------------------------")
    gameLib.startGame(gameName,[1,2],function (idGame,url,child) {
      var uriGame = url+"?suid="+req.session.suid;

      res.render("waitforplayer",{
        title:gameName,
        uriGame: uriGame
      });
    })

});

// router.get('/newGame',function (req,res,next) {
//   // TODO Refaire :)
//   var idGame = req.query.name.toString().trim();
//   var picked = req.app.get('config').games.find(function (game) {
//     return game.id == idGame;
//   });
//   var gameName = picked.name;
//   var uriGame = "http://"+ip+":3001";
//   res.render("waitforplayer",{
//     title:gameName,
//     uriGame: uriGame
//   });
// });


module.exports = router
