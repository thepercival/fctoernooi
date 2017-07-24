"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var round_1 = require("./round");
var CompetitionSeason = (function () {
    function CompetitionSeason() {
        this.participants = [];
        this.rounds = [];
    }
    CompetitionSeason.prototype.addRound = function (nrOfTeams, cascade) {
        var round = new round_1.Round(this);
        // add poules
        var nrOfPoules = round.getDefaultNrOfPoules(nrOfTeams);
        console.log(nrOfPoules);
        var nrOfExtraTeams = nrOfTeams % nrOfPoules;
        var nNrOfTeamsPerPoule = (nrOfTeams - nrOfExtraTeams) / nrOfPoules;
        for (var nI = 0; nI < nrOfPoules; nI++) {
            var nNrOfTeamsPerPouleTmp = nNrOfTeamsPerPoule;
            if (nrOfExtraTeams > 0) {
                nNrOfTeamsPerPouleTmp++;
                nrOfExtraTeams--;
            }
            round.addPoule(nNrOfTeamsPerPouleTmp);
        }
        this.rounds.push(round);
        /*if ( cascade == true ){
            if ( round.type == this.roundtype_knockout && nNrOfTeams > 1 ){
                if ( ( nNrOfTeams % 2 ) == 1 ) {
                    nNrOfTeams--;
                    nNrOfTeams /= 2;
                    nNrOfTeams++;
                }
                else {
                    nNrOfTeams /= 2;
                }
            }
        }*/
        return round;
    };
    ;
    return CompetitionSeason;
}());
exports.CompetitionSeason = CompetitionSeason;
