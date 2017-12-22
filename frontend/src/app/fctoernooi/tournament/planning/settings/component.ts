import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlanningService } from 'voetbaljs/planning/service';
import { Round } from 'voetbaljs/round';
import { RoundConfig } from 'voetbaljs/round/config';
import { IRoundConfig, RoundConfigRepository } from 'voetbaljs/round/config/repository';
import { RoundScoreConfig } from 'voetbaljs/round/scoreconfig';
import { StructureRepository } from 'voetbaljs/structure/repository';
import { StructureService } from 'voetbaljs/structure/service';

import { IAlert } from '../../../../app.definitions';
import { Tournament } from '../../../tournament';

// import { modelGroupProvider } from '@angular/forms/src/directives/ng_model_group';

@Component({
    selector: 'app-tournament-planning-settings',
    templateUrl: './component.html',
    styleUrls: ['./component.css']
})
export class TournamentPlanningSettingsComponent implements OnInit {

    @Input() tournament: Tournament;
    @Input() structureService: StructureService;
    @Output() updateRound = new EventEmitter<Round>();
    selectedRound: Round;
    enableTime: boolean;
    ranges: any = {};
    isCollapsed = true;
    alert: IAlert;
    modelConfig: IRoundConfig;
    modelRecreate: boolean;
    modelReschedule: boolean;
    processing: boolean;
    private planningService: PlanningService;
    validations: any = {
        minNrOfHeadtoheadMatches: 1,
        maxNrOfHeadtoheadMatches: 4,
        minWinPoints: 1,
        maxWinPoints: 10,
        minDrawPoints: 1,
        maxDrawPoints: 5,
        minMinutesPerGame: 0,
        maxMinutesPerGame: 60,
    };

    constructor(
        private roundConfigRepository: RoundConfigRepository,
        private structureRepository: StructureRepository
    ) {
        this.processing = true;
        this.setAlert('info', 'instellingen gelden ook voor volgende ronden');
    }

    ngOnInit() {
        this.changeRound(this.structureService.getFirstRound());
        this.initRanges();

        this.planningService = new PlanningService(
            this.tournament.getCompetitionseason().getStartDateTime()
        );
        this.processing = false;
    }

    private initRanges() {
        this.ranges.nrOfHeadtoheadMatches = [];
        for (let i = this.validations.minNrOfHeadtoheadMatches; i <= this.validations.maxNrOfHeadtoheadMatches; i++) {
            this.ranges.nrOfHeadtoheadMatches.push(i);
        }
        this.ranges.winPoints = [];
        for (let i = this.validations.minWinPoints; i <= this.validations.maxWinPoints; i++) {
            this.ranges.winPoints.push(i);
        }
        this.ranges.drawPoints = [];
        for (let i = this.validations.minDrawPoints; i <= this.validations.maxDrawPoints; i++) {
            this.ranges.drawPoints.push(i);
        }
    }

    changeRound(round: Round) {
        this.selectedRound = round;
        this.modelConfig = this.roundConfigRepository.objectToJsonHelper(this.selectedRound.getConfig());
        this.modelRecreate = false;
        this.modelReschedule = false;
        this.isCollapsed = true;
    }

    getWinnersLosersDescription(winnersOrLosers: number): string {
        const description = this.structureService.getWinnersLosersDescription(winnersOrLosers);
        return (description !== '' ? description + 's' : description);
    }

    getClassPostfix(winnersOrLosers: number): string {
        return winnersOrLosers === Round.WINNERS ? 'success' : (winnersOrLosers === Round.LOSERS ? 'danger' : '');
    }

    setNrOfHeadtoheadMatches(nrOfHeadtoheadMatches) {
        if (nrOfHeadtoheadMatches < this.validations.minNrOfHeadtoheadMatches
            || nrOfHeadtoheadMatches > this.validations.maxNrOfHeadtoheadMatches) {
            return;
        }
        this.modelConfig.nrOfHeadtoheadMatches = nrOfHeadtoheadMatches;
        this.modelRecreate = true; // this.planningService.create( this.selectedRound );
    }

    setWinPoints(winPoints) {
        if (winPoints < this.validations.minWinPoints
            || winPoints > this.validations.maxWinPoints) {
            return;
        }
        this.modelConfig.winPoints = winPoints;
    }


    setDrawPoints(drawPoints) {
        if (drawPoints < this.validations.minDrawPoints
            || drawPoints > this.validations.maxDrawPoints) {
            return;
        }
        this.modelConfig.drawPoints = drawPoints;
    }

    setHasExtension(hasExtension) {
        if (hasExtension !== true && hasExtension !== false) {
            return;
        }
        this.modelConfig.hasExtension = hasExtension;
        this.modelReschedule = true;  // this.planningService.reschedule(this.selectedRound);
    }

    setWinPointsExt(winPointsExt) {
        if (winPointsExt < this.validations.minWinPoints
            || winPointsExt > this.validations.maxWinPoints) {
            return;
        }
        this.modelConfig.winPointsExt = winPointsExt;
    }

    setDrawPointsExt(drawPointsExt) {
        if (drawPointsExt < this.validations.minDrawPoints
            || drawPointsExt > this.validations.maxDrawPoints) {
            return;
        }
        this.modelConfig.drawPointsExt = drawPointsExt;
    }

    setMinutesPerGameExt(minutesPerGameExt) {
        if (minutesPerGameExt < this.validations.minMinutesPerGame) {
            minutesPerGameExt = this.validations.minMinutesPerGame;
        } else if (minutesPerGameExt > this.validations.maxMinutesPerGame) {
            minutesPerGameExt = this.validations.maxMinutesPerGame;
        }
        if (minutesPerGameExt === this.modelConfig.minutesPerGame) {
            return;
        }
        this.modelConfig.minutesPerGameExt = minutesPerGameExt;
        if (this.modelConfig.enableTime) {
            this.modelReschedule = true;
        }
    }

    setMinutesPerGame(minutesPerGame) {
        if (minutesPerGame < this.validations.minMinutesPerGame) {
            minutesPerGame = this.validations.minMinutesPerGame;
        } else if (minutesPerGame > this.validations.maxMinutesPerGame) {
            minutesPerGame = this.validations.maxMinutesPerGame;
        }
        if (minutesPerGame === this.modelConfig.minutesPerGame) {
            return;
        }
        this.modelConfig.minutesPerGame = minutesPerGame;
        if (this.modelConfig.enableTime) {
            this.modelReschedule = true;
        }
    }

    setMinutesInBetween(minutesInBetween) {
        if (minutesInBetween < this.validations.minMinutesPerGame
            || minutesInBetween > this.validations.maxMinutesPerGame) {
            const avg = Math.floor(this.modelConfig.minutesPerGame / 2);
            this.modelConfig.minutesInBetween = avg;
            return;
        }
        this.modelConfig.minutesInBetween = minutesInBetween;
        if (this.modelConfig.enableTime) {
            this.modelReschedule = true; // this.planningService.reschedule( this.selectedRound );
        }
    }

    setEnableTime(enableTime) {
        if (enableTime !== true && enableTime !== false) {
            return;
        }
        this.modelConfig.enableTime = enableTime;
        this.modelReschedule = true; // this.planningService.reschedule( this.selectedRound );
    }

    getDirectionDescription(scoreConfig) {
        return RoundScoreConfig.getDirectionDescription(scoreConfig.getDirection());
    }

    setScoreConfigMaximum(scoreConfig: RoundScoreConfig, scoreConfigMaximum) {
        if (scoreConfigMaximum > 9999 || scoreConfigMaximum < 0) {
            return;
        }
        if (scoreConfigMaximum === 0 && scoreConfig.getParent() !== undefined) {
            this.setScoreConfigMaximum(scoreConfig.getParent(), 0);
        }
        scoreConfig.setMaximum(scoreConfigMaximum);
    }

    saveConfig() {
        this.setAlert('info', 'instellingen opslaan..');
        this.processing = true;

        this.updateRoundConfig(this.selectedRound.getConfig(), this.modelConfig);
        if (this.modelRecreate === true) {
            this.planningService.create(this.selectedRound);
        } else if (this.modelReschedule) {
            this.planningService.reschedule(this.selectedRound);
        }

        const firstRound = this.structureService.getFirstRound();
        const directionsTmp = this.getWinnersLosers(firstRound, this.selectedRound);
        this.structureRepository.editObject(firstRound, firstRound.getCompetitionseason())
            .subscribe(
                        /* happy path */ roundRes => {
                this.setAlert('info', 'instellingen opgeslagen');
                this.updateRound.emit(roundRes);
                const round = this.getRoundByWinnersLosers(roundRes, directionsTmp);
                this.changeRound(round);

            },
                /* error path */ e => { this.setAlert('danger', 'instellingen niet opgeslagen: ' + e); this.processing = false; },
                /* onComplete */() => this.processing = false
            );
    }

    protected updateRoundConfig(roundConfig: RoundConfig, modelToUpdateWith: IRoundConfig) {

        roundConfig.setQualifyRule(modelToUpdateWith.qualifyRule);
        roundConfig.setNrOfHeadtoheadMatches(modelToUpdateWith.nrOfHeadtoheadMatches);
        roundConfig.setWinPoints(modelToUpdateWith.winPoints);
        roundConfig.setDrawPoints(modelToUpdateWith.drawPoints);
        roundConfig.setHasExtension(modelToUpdateWith.hasExtension);
        roundConfig.setWinPointsExt(modelToUpdateWith.winPointsExt);
        roundConfig.setDrawPointsExt(modelToUpdateWith.drawPointsExt);
        roundConfig.setMinutesPerGameExt(modelToUpdateWith.minutesPerGameExt);
        roundConfig.setEnableTime(modelToUpdateWith.enableTime);
        roundConfig.setMinutesPerGame(modelToUpdateWith.minutesPerGame);
        roundConfig.setMinutesInBetween(modelToUpdateWith.minutesInBetween);

        roundConfig.getRound().getChildRounds().forEach((childRound) => {
            this.updateRoundConfig(childRound.getConfig(), modelToUpdateWith);
        });
    }

    protected getWinnersLosers(firstRound: Round, aChildRound: Round): number[] {
        const winnersLosers: number[] = [];
        while (aChildRound !== firstRound) {
            winnersLosers.push(aChildRound.getWinnersOrLosers());
            aChildRound = aChildRound.getParentRound();
        }
        return winnersLosers;
    }

    protected getRoundByWinnersLosers(firstRound: Round, winnersLosers: number[]): Round {
        let round: Round = firstRound;
        while (winnersLosers.length > 0) {
            round = round.getChildRound(winnersLosers.pop());
        }
        return round;
    }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    protected resetAlert(): void {
        this.alert = undefined;
    }
}
