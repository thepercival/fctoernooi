import { Component, Input, OnInit } from '@angular/core';
import { Tournament } from '../../../tournament';
import { Round } from 'voetbaljs/round';
import { StructureService } from 'voetbaljs/structure/service';
import { RoundConfig } from 'voetbaljs/round/config';
import { RoundScoreConfig } from 'voetbaljs/round/scoreconfig';
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

    enableTime: boolean;
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
        'minMinutesPerGame' : 0,
        'maxMinutesPerGame' : 60,
    };
    // this.complexForm = fb.group({
    //     'minutesPerGame': [null, maxValue(60)]
    // })

    constructor() {
    }

    ngOnInit() {
        this.config = this.round.getConfig();
        this.enableTime = this.config.getMinutesPerGame() > 0;
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

    setHasExtension( hasExtension ) {
        if ( hasExtension !== true && hasExtension !== false ) {
            return;
        }
        this.config.setHasExtension( hasExtension );
        this.planningService.reschedule( this.round );
    }

    setWinPointsExt( winPointsExt ) {
        if ( winPointsExt < this.validations.minWinPoints
            || winPointsExt > this.validations.maxWinPoints ) {
            return;
        }
        this.config.setWinPointsExt( winPointsExt );
    }

    setDrawPointsExt( drawPointsExt ) {
        if ( drawPointsExt < this.validations.minDrawPoints
            || drawPointsExt > this.validations.maxDrawPoints ) {
            return;
        }
        this.config.setDrawPointsExt( drawPointsExt );
    }

    setMinutesPerGameExt( minutesPerGameExt ) {
        if ( minutesPerGameExt < this.validations.minMinutesPerGame
            || minutesPerGameExt > this.validations.maxMinutesPerGame ) {
            const avg = Math.floor( ( this.validations.minMinutesPerGameExt + this.validations.maxMinutesPerGameExt ) / 2 );
            this.config.setMinutesPerGameExt( avg );
            return;
        }
        this.config.setMinutesPerGameExt( minutesPerGameExt );
        if ( this.config.getHasExtension() && this.config.getEnableTime() ) {
            this.planningService.reschedule(this.round);
        }
    }

    setMinutesPerGame( minutesPerGame ) {
        console.log(minutesPerGame);
        if ( minutesPerGame < this.validations.minMinutesPerGame
            || minutesPerGame > this.validations.maxMinutesPerGame ) {
            console.log('wrong value', minutesPerGame);
            const avg = Math.floor( ( this.validations.minMinutesPerGame + this.validations.maxMinutesPerGame ) / 2 );
            console.log('new value', avg);
            this.config.setMinutesPerGame( avg );
            return;
        }
        this.config.setMinutesPerGame( minutesPerGame );
        if ( this.config.getEnableTime() ) {
            this.planningService.reschedule(this.round);
        }
    }

    setMinutesInBetween( minutesInBetween ) {
        if ( minutesInBetween < this.validations.minMinutesPerGame
            || minutesInBetween > this.validations.maxMinutesPerGame ) {
            const avg = Math.floor( this.config.getMinutesPerGame() / 2 );
            this.config.setMinutesInBetween( avg );
            return;
        }
        this.config.setMinutesInBetween( minutesInBetween );
        if ( this.config.getEnableTime() ) {
            this.planningService.reschedule(this.round);
        }
    }

    setEnableTime( enableTime ) {
        if ( enableTime !== true && enableTime !== false ) {
            return;
        }
        this.config.setEnableTime( enableTime );
        this.planningService.reschedule( this.round );
    }

    setScoreConfigStart( scoreConfig: RoundScoreConfig, scoreConfigStart ) {
        if ( scoreConfigStart > 9999 || scoreConfigStart < 0 ) {
            return;
        }
        scoreConfig.setStart( scoreConfigStart );
    }

    setScoreConfigGoal( scoreConfig: RoundScoreConfig, scoreConfigGoal ) {
        if ( scoreConfigGoal > 9999 || scoreConfigGoal < 0 ) {
            return;
        }
        scoreConfig.setGoal( scoreConfigGoal );
    }
}
