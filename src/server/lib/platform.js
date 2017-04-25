module.exports = Platform;

var Joueur = require('./joueur.js');

function Platform() {

  var Platform = {};
  var listJoueurs = [];

  Platform.joueurExiste = function (nom) {
    return listJoueurs[nom] ? true : false;
  }

  Platform.ajouterJoueur = function (nom) {
    var joueur = undefined;

    if(!Platform.joueurExiste(nom) && nom != ""){
      joueur = Joueur(nom);
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
