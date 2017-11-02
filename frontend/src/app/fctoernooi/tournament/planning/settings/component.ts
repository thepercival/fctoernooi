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

    ranges: any = {};
    config: RoundConfig;
    private planningService: PlanningService;
    validations: any = {
        'minNrOfHeadtoheadMatches' : 1,
        'maxNrOfHeadtoheadMatches' : 4,
        'minWinPoints' : 1,
        'maxWinPoints' : 10,
        'minDrawPoints' : 1,
        'maxDrawPoints' : 5,
        'minNrOfMinutesPerGame' : 1,
        'maxNrOfMinutesPerGame' : 30,
    };

    constructor() {
    }

    ngOnInit() {
        this.config = this.round.getConfig();
        console.log(this.config);

        this.initRanges();

        this.planningService = new PlanningService(
            this.tournament.getCompetitionseason().getStartDateTime()
        );
    }

    private initRanges() {
        this.ranges.nrOfHeadtoheadMatches = [];
        for ( let i = this.validations.minNrOfHeadtoheadMatches ; i <= this.validations.maxNrOfHeadtoheadMatches ; i++ ) {
            this.ranges.nrOfHeadtoheadMatches.push( i );
        }
        this.ranges.winPoints = [];
        for ( let i = this.validations.minWinPoints ; i <= this.validations.maxWinPoints ; i++ ) {
            this.ranges.winPoints.push( i );
        }
        this.ranges.drawPoints = [];
        for ( let i = this.validations.minDrawPoints ; i <= this.validations.maxDrawPoints ; i++ ) {
            this.ranges.drawPoints.push( i );
        }
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

    setWinPoints( winPoints ) {
        if ( winPoints < this.validations.minWinPoints
            || winPoints > this.validations.maxWinPoints ) {
            return;
        }
        this.config.setWinPoints( winPoints );
    }

    setDrawPoints( drawPoints ) {
        if ( drawPoints < this.validations.minDrawPoints
            || drawPoints > this.validations.maxDrawPoints ) {
            return;
        }
        this.config.setDrawPoints( drawPoints );
    }
}
