'use strict';

// lib.js

const BURNING_WARNING_DURATION = 500;

var createMatch = function(cbMatchIsBurning, cbMatchHasBurned, cbMatchHasTurnedOff, maxDurationInSec, minDurationInSec) {

    var isBurning = false,
        hasBurned = false,
        duration = generateDuration(maxDurationInSec, minDurationInSec),
        durationBeforeTurnOff = duration,
        idTimerMatchHasBurned = null,
        idTimerMatchIsBurning = null;


    var crackMatche = function() {
        if (isBurning === false && hasBurned === false) {
            var timeBeforeMatchBurned = duration * 1000;
            cbMatchIsBurning();
            idTimerMatchIsBurning = setInterval(cbIsBurning, BURNING_WARNING_DURATION);
            idTimerMatchHasBurned = setTimeout(cbHasBurned, timeBeforeMatchBurned);
            isBurning = true;
        }
    }

    var turnOffMatch = function() {
        if (isBurning === true && hasBurned === false) {
            clearInterval(idTimerMatchIsBurning);
            clearTimeout(idTimerMatchHasBurned);
            cbMatchHasTurnedOff();
        }
    }

    var getDuration = function() {
        return durationBeforeTurnOff;
    }

    function cbHasBurned() {
        isBurning = false;
        hasBurned = true;
        clearInterval(idTimerMatchIsBurning);
        cbMatchHasBurned();
    }

    function cbIsBurning() {
        cbMatchIsBurning();
        if (durationBeforeTurnOff > 0) {
            durationBeforeTurnOff--;
        }
    }

    return {
        crack: crackMatche,
        turnOff: turnOffMatch,
        getDuration: getDuration
    };
};

function generateDuration(maxDurationInSec, minDurationInSec) {
    maxDurationInSec = maxDurationInSec + 1;
    return Math.floor((Math.random() * (maxDurationInSec - minDurationInSec)) + minDurationInSec);
}


// test.js

function cbMatchIsBurning() {
    console.log("je brule");
}

function cbMatchHasBurned() {
    console.log("je suis totalement brulé");
}

function cbMatchHasTurnedOff() {
    console.log("On m'a éteint");
}


var createMatch = createMatch.bind(null, cbMatchIsBurning, cbMatchHasBurned, cbMatchHasTurnedOff, 10, 5);
var myMatch = createMatch();
myMatch.crack();
console.log(myMatch.getDuration());
setTimeout(function() {
    myMatch.turnOff();
    console.log(myMatch.getDuration());
}, 9000);