
var express = require('express')
var router = express.Router()

router.get('/home',function (req,res,next) {
    res.render('welcome');
});

router.get('/chooseGame',function (req,res,next) {
  var games = req.app.get('config').games;
  res.render('chooseGame',{games:games});
});

router.get('/newGame',function (req,res,next) {
  // TODO Refaire :)
  var idGame = req.query.name.toString().trim();
  var picked = req.app.get('config').games.find(function (game) {
    return game.id == idGame;
  });
  var gameName = picked.name;
  var uriGame = "http://"+ip+":3001";
  res.render("waitforplayer",{
    title:gameName,
    uriGame: uriGame
  });
});


module.exports = router
