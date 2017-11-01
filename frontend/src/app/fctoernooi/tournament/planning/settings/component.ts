import { Component, Input, OnInit } from '@angular/core';
import { Tournament } from '../../../tournament';
import { Round } from 'voetbaljs/round';
import { StructureService } from 'voetbaljs/structure/service';
import { RoundConfig } from 'voetbaljs/round/config';
import { PlanningService } from 'voetbaljs/planning/service';

@Component({
    selector: 'app-tournament-planning-settings',
    templateUrl: './component.html',
    styleUrls: ['./component.css']
})
export class TournamentPlanningSettingsComponent implements OnInit {

    @Input() tournament: Tournament;
    @Input() round: Round;
    @Input() structureService: StructureService;

    nrOfHeadtoheadMatches: number[] = [];
    config: RoundConfig;
    private planningService: PlanningService;
    validations: any = {
        'minNrOfHeadtoheadMatches' : 1,
        'maxNrOfHeadtoheadMatches' : 4,
        'minwinpointspergame' : 1,
        'maxwinpointspergame' : 10
    };

    constructor() {
    }

    ngOnInit() {
        this.config = this.round.getConfig();
        console.log(this.config);
        for ( let i = this.validations.minNrOfHeadtoheadMatches ; i <= this.validations.maxNrOfHeadtoheadMatches ; i++ ) {
            this.nrOfHeadtoheadMatches.push( i );
        }
        this.planningService = new PlanningService(
            this.tournament.getCompetitionseason().getStartDateTime()
        );
    }


    getWinnersLosersDescription( winnersOrLosers: number ): string {
        const description = this.structureService.getWinnersLosersDescription( winnersOrLosers );
        return ( description !== '' ? description + 's' : description );
    }

    getClassPostfix( winnersOrLosers: number): string {
        return winnersOrLosers === Round.WINNERS ? 'success' : ( winnersOrLosers === Round.LOSERS ? 'danger' : '');
    }

    setNrOfHeadtoheadMatches( nrOfHeadtoheadMatches ) {
        if ( nrOfHeadtoheadMatches < this.validations.minNrOfHeadtoheadMatches
            || nrOfHeadtoheadMatches > this.validations.maxNrOfHeadtoheadMatches ) {
            return;
        }
        this.config.setNrOfHeadtoheadMatches( nrOfHeadtoheadMatches );
        this.planningService.create( this.round );
        // this.planningService.reschedule( this.round );
    }
}
