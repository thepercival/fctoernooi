"use strict";
/**
 * Created by cdunnink on 7-12-2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var poule_1 = require("./poule");
var Round = (function () {
    function Round(competitonSeason) {
        this.poules = [];
        this.fromQualifyRules = [];
        this.toQualifyRules = [];
        this.competitonSeason = competitonSeason;
        this.nr = competitonSeason.rounds.length + 1;
    }
    Round.prototype.addPoule = function (nrOfParticipants) {
        // get nrofplaces from last poule
        /*if ( nrOfParticipants == undefined ){
            nrofplaces = 4;
            if (round.poules.length > 0 ){
                var pouletmp = round.poules.pop();
                nrofplaces = pouletmp.places.length;
                round.poules.push(pouletmp);
            }
        }*/
        var poule = new poule_1.Poule(this);
        // add pouleplaces
        for (var nJ = 0; nJ < nrOfParticipants; nJ++) {
            poule.addPlace();
        }
        this.poules.push(poule);
        return poule;
    };
    ;
    Round.prototype.getDefaultNrOfPoules = function (nrOfTeams) {
        var nNrOfPoules;
        if (this.nr > 1) {
            return Math.floor(nrOfTeams / 2); // knockout
        }
        switch (nrOfTeams) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 7:
                nNrOfPoules = 1;
                break;
            case 6:
            case 8:
            case 9:
            case 10:
            case 11:
                nNrOfPoules = 2;
                break;
            case 12:
            case 13:
            case 14:
            case 15:
                nNrOfPoules = 3;
                break;
            case 16:
            case 17:
            case 18:
            case 19:
            case 20:
                nNrOfPoules = 4;
                break;
            case 21:
            case 22:
            case 23:
            case 24:
            case 25:
                nNrOfPoules = 5;
                break;
            case 26:
            case 27:
            case 29:
            case 30:
                nNrOfPoules = 6;
                break;
            case 28:
            case 31:
                nNrOfPoules = 7;
                break;
            default:
                nNrOfPoules = 8;
        }
        return nNrOfPoules;
    };
    Round.prototype.getDefaultNrOfMutualGames = function () {
        return 1;
    };
    Round.prototype.getNrOfParticipants = function () {
        var nNrOfParticipants = 0;
        this.poules.forEach(function (poule) {
            nNrOfParticipants += poule.places.length;
        });
        return nNrOfParticipants;
    };
    Round.prototype.next = function () {
        if (this.toQualifyRules.length == 0)
            return null;
        return this.toQualifyRules[0].toRound;
    };
    return Round;
}());
exports.Round = Round;
