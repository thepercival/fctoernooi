import {VoetbalInterface} from './interface';
import {Round} from './round';
import {Participant} from './participant';

export class CompetitionSeason implements VoetbalInterface{
    id: number;
    name: string;
    seasonname: string;
    participants: Participant[] = [];
    rounds: Round[] = [];

    addRound( nrOfTeams: number, cascade: boolean ): Round {

        let round = new Round( this );

        // add poules
        let nrOfPoules = round.getDefaultNrOfPoules( nrOfTeams );
        let nrOfExtraTeams = nrOfTeams % nrOfPoules;
        let nNrOfTeamsPerPoule = ( nrOfTeams - nrOfExtraTeams ) / nrOfPoules;
        for( var nI = 0 ; nI < nrOfPoules ; nI++ ){
            var nNrOfTeamsPerPouleTmp = nNrOfTeamsPerPoule;
            if ( nrOfExtraTeams > 0 ) {
                nNrOfTeamsPerPouleTmp++;
                nrOfExtraTeams--;
            }
            round.addPoule( nNrOfTeamsPerPouleTmp );
        }
        this.rounds.push( round );

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
}