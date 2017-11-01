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

    nrofheadtoheadmatches: number[] = [];
    config: RoundConfig;
    private planningService: PlanningService;
    validations: any = {
        'minnrofheadtoheadmatches' : 1,
        'maxnrofheadtoheadmatches' : 4,
        'minwinpointspergame' : 1,
        'maxwinpointspergame' : 10
    };

    constructor() {
    }

    ngOnInit() {
        this.config = this.round.getConfig();
        for ( let i = this.validations.minnrofheadtoheadmatches ; i <= this.validations.maxnrofheadtoheadmatches ; i++ ) {
            this.nrofheadtoheadmatches.push( i );
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

    setNrofheadtoheadmatches( nrofheadtoheadmatches ) {
        if ( nrofheadtoheadmatches < this.validations.minnrofheadtoheadmatches
            || nrofheadtoheadmatches > this.validations.maxnrofheadtoheadmatches ) {
            return;
        }
        this.config.setNrofheadtoheadmatches( nrofheadtoheadmatches );
        this.planningService.reschedule( this.round );
    }
}
