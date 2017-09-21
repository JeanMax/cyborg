
var express = require('express')
var router = express.Router()

var gameLib = require('../lib/game_launcher.js');

router.get('/home',function (req,res,next) {
    res.render('welcome');
});

router.get('/setName',function (req,res,next) {

  // On ajouter le player à la liste des players
  var players = req.app.get('players');

  var suid = req.session.suid;
  var name = req.query.name;

  players[suid].name = name;

  res.redirect('games');
})

router.get('/games',function (req,res,next) {

  // On ajouter le player à la liste des players
  var games = req.app.get('config').games;
  var allGames = [];
  for (var id in games) {
    var name = games[id].name;
    allGames.push({
      id : id,
      name : name
    })
  }

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
    var games = req.app.get('config').games;

    var game = games[gameName];

    console.error("------------------------------------------")
    console.error("ATTENTION NOMBRE DE JOUEUR ECRIT EN DUR !!!")
    console.error("------------------------------------------")

    function onReady(idGame,url,child) {
        var uriGame = url+"?suid="+req.session.suid;

        res.render("waitforplayer",{
          title:gameName,
          uriGame: uriGame
        });
    }

    function onFinish(err,result) {

      var players = req.app.get('players');
      var keys = Object.keys(players);


      setTimeout(function(){
        for (key of keys) {
            players[key].socket.emit("srcIframe",{result: result});
        }
      }, 3000);


      //Je previens socket io de rediriger le iframe sur le jeu principaal
      console.error(err);
      console.log(result);
    }
    gameLib.startGame(game.path,[1,2],[],onReady,onFinish)

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
