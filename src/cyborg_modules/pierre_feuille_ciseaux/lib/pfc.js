var game = {};
game.joueurs = [];

game.set = function (idJoueur,choix) {
  game.joueurs[idJoueur] = choix;
}


game.isOk = function () {
  return game.joueurs["j1"] && game.joueurs["j2"] ;
}

game.result = function () {
  if(this.isOk()){
    if( (game.joueurs["j1"] === "pierre" && game.joueurs["j2"] === "ciseaux")
     || (game.joueurs["j1"] === "feuille" && game.joueurs["j2"] === "pierre")
     || (game.joueurs["j1"] === "ciseaux" && game.joueurs["j2"] === "feuille")
   ){ return "Joueur 1"}
   else if ( (game.joueurs["j2"] === "pierre" && game.joueurs["j1"] === "ciseaux")
          || (game.joueurs["j2"] === "feuille" && game.joueurs["j1"] === "pierre")
          || (game.joueurs["j2"] === "ciseaux" && game.joueurs["j1"] === "feuille")
   ) { return "Joueur 2"}
   else { return "Egalité"}
  }
  else {
    return "Pas fini"
  }
}

module.exports = game;
