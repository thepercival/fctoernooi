"use strict";
/**
 * Created by cdunnink on 7-12-2016.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var round_1 = require("../voetbal/round");
var qualifyrule_1 = require("../voetbal/qualifyrule");
var CompetitionSeasonRoundComponent = (function () {
    function CompetitionSeasonRoundComponent() {
    }
    CompetitionSeasonRoundComponent.prototype.addPoulePlaceToNextRound = function () {
        var nextRound = this.round.next();
        if (nextRound == null) {
            nextRound = this.round.competitonSeason.addRound(1, false);
        }
        // maak qualifyrule aan
        var qualifyRule = new qualifyrule_1.QualifyRule(this.round, nextRound);
        this.round.toQualifyRules.push(qualifyRule);
        nextRound.fromQualifyRules.push(qualifyRule);
        // get pouleplace from current round to qualify
        // get pouleplace from next round to attach
    };
    ///////////////////////////////////////////////////////////////
    CompetitionSeasonRoundComponent.prototype.updateQualifyRules = function (fromRound, toRound, newnrofqualifyers) {
        /*var roundpouleplacespernumber = createPoulePlacesPerNumber( fromRound );
        var nextroundpouleplaceszigzag = createPoulePlacesZigZag( toRound );
        for ( var nI = 0 ; nI < roundpouleplacespernumber.length ; nI++ ){

            if ( newnrofqualifyers >= roundpouleplacespernumber[nI].length )
            {
                var tmp = roundpouleplacespernumber[ nI ];
                for ( var nJ = 0 ; nJ < tmp.length ; nJ++ ){
                    var nextroundpouleplace = nextroundpouleplaceszigzag.shift();
                    addQualifyRule( fromRound, toRound, [ tmp[nJ] ], [ nextroundpouleplace ] );
                }
                newnrofqualifyers -= tmp.length;
            }
            else if ( newnrofqualifyers > 0 ) {
                var tmp = roundpouleplacespernumber[ nI ];
                var nexttmp = [];
                for ( var nJ = 0 ; nJ < tmp.length ; nJ++ ) {
                    var nextroundpouleplacezigzag = nextroundpouleplaceszigzag.shift();
                    if ( nextroundpouleplacezigzag != undefined )
                        nexttmp.push( nextroundpouleplacezigzag );
                }
                // now tmp and nexttmp are filled correct
                addQualifyRule( fromRound, toRound, tmp, nexttmp );
                newnrofqualifyers = 0;
            }
            else {
                var tmp = roundpouleplacespernumber[ nI ];
                for ( var nJ = 0 ; nJ < tmp.length ; nJ++ ){
                    tmp[nJ].toqualifyrule = null;
                }
            }
        }*/
    };
    /*
    createPoulePlacesPerNumber(round ) {
        // reset next and reorder pouleplaces
        var pouleplacespernumber = [];
        {
            var bValidPoulePlaces = true;
            var nPoulePlaceNumber = 0;
            while (bValidPoulePlaces) {
                bValidPoulePlaces = false;
                for (var nPouleNumber = 0; nPouleNumber < round.poules.length; nPouleNumber++) {
                    if (round.poules[nPouleNumber] != undefined && round.poules[nPouleNumber].places[nPoulePlaceNumber] != undefined) {
                        bValidPoulePlaces = true;

                        if ( pouleplacespernumber[nPoulePlaceNumber] == undefined )
                            pouleplacespernumber[nPoulePlaceNumber] = [];

                        var pouleplace = round.poules[nPouleNumber].places[nPoulePlaceNumber];
                        pouleplacespernumber[nPoulePlaceNumber].push(pouleplace);
                    }
                }
                nPoulePlaceNumber++;
            }
        }
        return pouleplacespernumber;
    }

    createPoulePlacesZigZag(round ) {
        // reset next and reorder pouleplaces
        var pouleplaces = [];
        {
            var nZigZagNumber = -1;
            var bValidPoulePlaces = true;
            var nPoulePlaceNumber = 0;
            while (bValidPoulePlaces) {
                var pouleplacesfornumber = [];
                bValidPoulePlaces = false;
                for (var nPouleNumber = 0; nPouleNumber < round.poules.length; nPouleNumber++) {
                    if (round.poules[nPouleNumber] != undefined && round.poules[nPouleNumber].places[nPoulePlaceNumber] != undefined) {
                        bValidPoulePlaces = true;

                        var pouleplace = round.poules[nPouleNumber].places[nPoulePlaceNumber];
                        pouleplacesfornumber.push(pouleplace);
                    }
                }
                if ( nPoulePlaceNumber == nZigZagNumber ) {
                    pouleplacesfornumber.reverse();
                    nZigZagNumber += 2;
                }
                pouleplaces = pouleplaces.concat( pouleplacesfornumber );
                nPoulePlaceNumber++;
            }
        }
        return pouleplaces;
    }
    ////////////////////////////////////////////////////////////////////
*/
    CompetitionSeasonRoundComponent.prototype.removePoulePlaceFromNextRound = function () {
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", round_1.Round)
    ], CompetitionSeasonRoundComponent.prototype, "round", void 0);
    CompetitionSeasonRoundComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'toernooi-ronde',
            templateUrl: 'round.component.html',
            styleUrls: ['round.component.css']
        }),
        __metadata("design:paramtypes", [])
    ], CompetitionSeasonRoundComponent);
    return CompetitionSeasonRoundComponent;
}());
exports.CompetitionSeasonRoundComponent = CompetitionSeasonRoundComponent;
