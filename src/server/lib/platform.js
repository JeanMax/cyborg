module.exports = Platform;

var JoueurFactory = require('./joueur.js');

function Platform() {

  var Platform = {};
  var listJoueurs = [];

  Platform.joueurExiste = function (nom) {
    return listJoueurs[nom] ? true : false;
  }

  Platform.ajouterJoueur = function (nom) {
    var joueur ;

    if(!Platform.joueurExiste(nom) && nom != ""){
      joueur = JoueurFactory(nom);
      listJoueurs[nom] = joueur;
    }
    
    return joueur;
  }

  Platform.recupererJoueur = function (nom) {
    var joueur = listJoueurs[nom];
    return joueur;
  }

  return Platform;

}
