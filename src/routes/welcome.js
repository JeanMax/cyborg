
var express = require('express')
var router = express.Router()

var gameLib = require('../lib/game_launcher.js');

router.get('/home',function (req,res,next) {
    res.render('welcome');
});

router.get('/chooseGame',function (req,res,next) {
  var allGames = req.app.get('config').games;
  var instanceGames = gameLib.getGameInstances();

  res.render('chooseGame',{
    allGames: allGames,
    instanceGames: instanceGames
  });
});

router.get('/new/:gameName',function (req,res,next) {
    
    var gameName = req.params.gameName.toString().trim();

    gameLib.startGame(gameName,[],function (idGame,url,child) {
      var uriGame = url;

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
