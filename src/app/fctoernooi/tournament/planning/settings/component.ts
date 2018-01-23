import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
    IRoundConfig,
    PlanningService,
    Round,
    RoundConfig,
    RoundConfigRepository,
    RoundScoreConfig,
    StructureRepository,
    StructureService,
} from 'ngx-sport';

import { IAlert } from '../../../../app.definitions';

// import { modelGroupProvider } from '@angular/forms/src/directives/ng_model_group';

@Component({
    selector: 'app-tournament-planning-settings',
    templateUrl: './component.html',
    styleUrls: ['./component.css']
})
export class TournamentPlanningSettingsComponent implements OnInit {

    @Input() structureService: StructureService;
    @Output() updateRound = new EventEmitter<Round>();
    enableTime: boolean;
    ranges: any = {};
    allRoundsByNumber: any;
    selectedRoundNumber: number;
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
        // debugger;
        this.processing = true;
    }

    ngOnInit() {
        this.allRoundsByNumber = this.structureService.getAllRoundsByNumber();
        this.changeRoundNumber(this.structureService.getFirstRound().getNumber());
        this.initRanges();

        this.planningService = new PlanningService(this.structureService);
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

    changeRoundNumber(roundNumber: number) {
        this.selectedRoundNumber = roundNumber;
        this.modelConfig = this.roundConfigRepository.objectToJsonHelper(
            this.getFirstRoundOfRoundNumber(this.selectedRoundNumber).getConfig());
        this.modelRecreate = false;
        this.modelReschedule = false;
        this.isCollapsed = true;
        if (this.structureService.getFirstRound().isStarted()) {
            this.setAlert('warning', 'het toernooi is al begonnen, je kunt niet meer wijzigen');
        }
    }

    getFirstRoundOfRoundNumber(roundNumber): Round {
        return this.allRoundsByNumber[this.selectedRoundNumber][0];
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
        this.modelRecreate = true; // this.planningService.create( this.selectedRoundNumber );
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
        this.modelReschedule = true;  // this.planningService.reschedule(this.selectedRoundNumber);
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
            this.modelReschedule = true; // this.planningService.reschedule( this.selectedRoundNumber );
        }
    }

    setEnableTime(enableTime) {
        if (enableTime !== true && enableTime !== false) {
            return;
        }
        this.modelConfig.enableTime = enableTime;
        this.modelReschedule = true; // this.planningService.reschedule( this.selectedRoundNumber );
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

    isScoreConfigReadOnly(scoreConfig: RoundScoreConfig) {
        if (scoreConfig.getChild() !== undefined && scoreConfig.getChild().getMaximum() === 0) {
            return true;
        }
        if (this.modelConfig.enableTime && scoreConfig.getParent() === undefined) {
            return true;
        }

        if (this.planningService.isStarted(this.selectedRoundNumber)) {
            return true;
        }

        return false;
    }

    getSelectRoundNumberButtonClassPostfix(roundNumber: number) {
        if (roundNumber >= this.selectedRoundNumber) {
            return 'primary';
        }
        return 'secondary';
    }

    saveConfig() {
        this.setAlert('info', 'instellingen opslaan..');
        this.processing = true;

        this.updateRoundConfig(this.selectedRoundNumber, this.modelConfig);
        if (this.modelRecreate === true) {
            this.planningService.create(this.selectedRoundNumber);
        } else if (this.modelReschedule) {
            this.planningService.reschedule(this.selectedRoundNumber);
        }

        const firstRound = this.structureService.getFirstRound();
        // const directionsTmp = this.getWinnersLosers(firstRound, this.selectedRound);
        this.structureRepository.editObject(firstRound, firstRound.getCompetitionseason())
            .subscribe(
                        /* happy path */ firstRoundRes => {
                console.log('should update structureService???????');
                this.setAlert('info', 'instellingen opgeslagen');
                this.updateRound.emit(firstRoundRes);
                // this.changeRoundNumber(round);

            },
                /* error path */ e => { this.setAlert('danger', 'instellingen niet opgeslagen: ' + e); this.processing = false; },
                /* onComplete */() => this.processing = false
            );
    }

    protected updateRoundConfig(roundNumber: number, modelToUpdateWith: IRoundConfig) {
        const rounds = this.allRoundsByNumber[roundNumber];
        rounds.forEach(round => {
            round.getConfig().setQualifyRule(modelToUpdateWith.qualifyRule);
            round.getConfig().setNrOfHeadtoheadMatches(modelToUpdateWith.nrOfHeadtoheadMatches);
            round.getConfig().setWinPoints(modelToUpdateWith.winPoints);
            round.getConfig().setDrawPoints(modelToUpdateWith.drawPoints);
            round.getConfig().setHasExtension(modelToUpdateWith.hasExtension);
            round.getConfig().setWinPointsExt(modelToUpdateWith.winPointsExt);
            round.getConfig().setDrawPointsExt(modelToUpdateWith.drawPointsExt);
            round.getConfig().setMinutesPerGameExt(modelToUpdateWith.minutesPerGameExt);
            round.getConfig().setEnableTime(modelToUpdateWith.enableTime);
            round.getConfig().setMinutesPerGame(modelToUpdateWith.minutesPerGame);
            round.getConfig().setMinutesInBetween(modelToUpdateWith.minutesInBetween);
        });
        if (rounds[roundNumber + 1] !== undefined) {
            this.updateRoundConfig(roundNumber + 1, modelToUpdateWith);
        }
    }

    // dit is idem als get position
    // protected getWinnersLosers(firstRound: Round, aChildRound: Round): number[] {
    //     const winnersLosers: number[] = [];
    //     while (aChildRound !== firstRound) {
    //         winnersLosers.push(aChildRound.getWinnersOrLosers());
    //         aChildRound = aChildRound.getParentRound();
    //     }
    //     return winnersLosers;
    // }

    // protected getRoundByWinnersLosers(firstRound: Round, winnersLosers: number[]): Round {
    //     let round: Round = firstRound;
    //     while (winnersLosers.length > 0) {
    //         round = round.getChildRound(winnersLosers.pop());
    //     }
    //     return round;
    // }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    protected resetAlert(): void {
        this.alert = undefined;
    }
}
