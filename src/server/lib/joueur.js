module.exports = Joueur;

function Joueur(nom) {

  var Joueur = {};
  var name = nom || "PasDeNom";
  var game = undefined;
  var playing = false;

  Joueur.name = function (pname) {
    if(pname){
      name = pname;
    }
    return name;
  }

  Joueur.hasName = function () {
    return name ? true : false;
  }

  Joueur.game = function (pgame) {
    if(pgame){
      game = pgame;
    }
    return game;
  }

  Joueur.hasGame = function () {
    return game ? true : false;
  }

  Joueur.play = function () {
    playing = true;
  }

  Joueur.stopPlay = function () {
    playing = false;
  }

  Joueur.isPlaying = function () {
    return playing;
  }

  return Joueur;
}
