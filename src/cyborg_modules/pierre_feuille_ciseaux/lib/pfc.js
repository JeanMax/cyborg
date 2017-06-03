var game = {};
game.joueurs = [];


game.setIds = function (ids) {
  for (id of ids) {
    game.joueurs[id] = null;
  }
}

game.setChoix = function (idJoueur,choix) {
  game.joueurs[idJoueur] = choix;
}


game.isOk = function () {
  var isOk = false;
  if(game.joueurs.indexOf(null) === -1){
    isOk = true;
  }
  return isOk;
}

game.result = function () {
  var ids = Object.keys(game.joueurs);

  if(this.isOk()){
    if( (game.joueurs[ids[0]] === "pierre" && game.joueurs[ids[1]] === "ciseaux")
     || (game.joueurs[ids[0]] === "feuille" && game.joueurs[ids[1]] === "pierre")
     || (game.joueurs[ids[0]] === "ciseaux" && game.joueurs[ids[1]] === "feuille")
   )
   {
    var result = {}
     result[ids[0]] = 1;
     result[ids[1]] = 0;

     return result;
   }
   else if ( (game.joueurs[ids[1]] === "pierre" && game.joueurs[ids[0]] === "ciseaux")
          || (game.joueurs[ids[1]] === "feuille" && game.joueurs[ids[0]] === "pierre")
          || (game.joueurs[ids[1]] === "ciseaux" && game.joueurs[ids[0]] === "feuille")
   )
   {
     var result = {}
     result[ids[0]] = 0;
     result[ids[1]] = 1;

     return result;
   }
   else {
     var result = {}
     result[ids[0]] = 0;
     result[ids[0]] = 0;

     return result;
   }
  }
  else {
    return "Pas fini"
  }
}

module.exports = game;
