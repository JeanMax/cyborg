/*
* spa.js
* Root namespace module
*/

/*jslint white: true, browser: true, devel: true, forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 4, maxerr: 50 */

var spa = (function () {
  var initModule = function ( $container ) {
    $container.html(
      '<h1 style="display:inline-block; margin:25px;">'
      + 'hello world!'
      + '</h1>'
      );
    };
    return { initModule: initModule };
}());

//
// // Module /spa/
// // Fournit un chat slider
//
// var spa = (function ( $ ) {
//   // Portée du module
//   var
//     // Definition des constantes
//     configMap = {
//       extended_height : 434,
//       extended_title : 'Cliquez pour retracter',
//       retracted_height : 16,
//       retracted_title : 'Cliquer pour etendre',
//       template_html : '<div class="spa-slider"><\/div>'
//     },
//
//     // Declaration des autres modules à portée
//     $chatSlider,
//     toggleSlider, onClickSlider, initModule;
//
//     // DOM method /toggleSlider/
//     // Change la hauteur du slider
//     //
//
//     toggleSlider = function () {
//       var
//         slider_height = $chatSlider.height();
//
//       // Etendre le slider si il est pleinement retracté
//       if(slider_height === configMap.retracted_height) {
//         $chatSlider
//           .animate({height : configMap.extended_height})
//           .attr( 'title', configMap.extended_title);
//         return true;
//       }
//
//       // Retracté le slider si il est pleinement étendue
//       else if (slider_height === configMap.extended_height) {
//         $chatSlider
//           .animate({height : configMap.retracted_height})
//           .attr( 'title', configMap.retracted_title);
//         return true;
//       }
//
//       //Ne pas faire d'action si le slider est en transition
//       return false;
//     }
//
//     // Gestionnaire d'evenemnt /onClickSlider/
//     // Recoit un evenment click et appels toggleSlider
//     //
//     onClickSlider = function ( event ) {
//       toggleSlider();
//       return false;
//     }
//
//     // Méthode publique /initModule/
//     // Configurer état initial et fournire les fonctionnalités
//     //
//     initModule = function ( $container ) {
//
//       // render HTML
//       $container.html(configMap.template_html);
//
//       $chatSlider = $container.find('.spa-slider');
//       // initialize slider height and title
//       // bind the user click event to the event handler
//       $chatSlider
//         .attr( 'title' , configMap.retracted_title )
//         .click ( onClickSlider );
//
//       return true;
//     };
//
//     return {initModule : initModule };
//
// })( jQuery );
