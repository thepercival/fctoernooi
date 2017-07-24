/**
 * Created by cdunnink on 7-12-2016.
 */

import { Component, Input } from '@angular/core';
import { Round } from '../voetbal/round';
import {QualifyRule} from "../voetbal/qualifyrule";
import { CompetitionSeason } from '../voetbal/competitionseason';

@Component({
    moduleId: module.id,
    selector: 'toernooi-ronde',
    templateUrl: 'round.component.html',
    styleUrls: [ 'round.component.css' ]
})

export class CompetitionSeasonRoundComponent {
    @Input()
    round: Round;

    constructor(

    ) {}

    addPoulePlaceToNextRound() {
        let nextRound: Round = this.round.next();
        if ( nextRound == null ) {
            nextRound = this.round.competitonSeason.addRound( 1, false );
        }
        // maak qualifyrule aan
        let qualifyRule: QualifyRule = new QualifyRule( this.round, nextRound);
        this.round.toQualifyRules.push( qualifyRule );
        nextRound.fromQualifyRules.push( qualifyRule );

        // get pouleplace from current round to qualify

        // get pouleplace from next round to attach
    }

    ///////////////////////////////////////////////////////////////
    updateQualifyRules(fromRound, toRound, newnrofqualifyers )
    {
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

    }
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
    removePoulePlaceFromNextRound() {

    }




}

