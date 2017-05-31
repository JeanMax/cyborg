// const ip = require("ip").address();
// var initPort = 3000;
// var child = require('child_process').fork('./cyborg_modules/pfc/index.js');

const path = require("path");
var express = require('express')
var router = express.Router()

var gameLib = require('../lib/game_launcher.js');

// router.get('/new/:gameName',function (req,res,next) {
//     var gameName = req.params.gameName.toString().trim();
//
//
//
//     gameLib.startGame("pfc",[],function (idGame,url) {
//       var uriGame = url;
//
//       res.render("waitforplayer",{
//         title:gameName,
//         uriGame: uriGame
//       });
//     })
//
// });

module.exports = router
