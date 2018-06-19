import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import {
    PlanningRepository,
    PlanningService,
    Round,
    RoundConfig,
    RoundConfigRepository,
    RoundConfigScore,
    RoundConfigService,
    StructureNameService,
    StructureRepository,
} from 'ngx-sport';

import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';
import { TournamentService } from '../service';

@Component({
    selector: 'app-rounds-settings',
    templateUrl: './rounds.component.html',
    styleUrls: ['./rounds.component.css']
})
export class RoundsSettingsComponent extends TournamentComponent implements OnInit {

    enableTime: boolean;
    ranges: any = {};
    allRoundsByNumber: any;
    selectedRoundNumber: number;
    modelConfig: RoundConfig;
    modelRecreate: boolean;
    modelReschedule: boolean;
    customForm: FormGroup;
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
    planningService: PlanningService;
    private roundConfigService: RoundConfigService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        private roundConfigRepository: RoundConfigRepository,
        public nameService: StructureNameService,
        private planningRepository: PlanningRepository
    ) {
        super(route, router, tournamentRepository, sructureRepository);
        this.initRanges();
        this.roundConfigService = new RoundConfigService();
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

    ngOnInit() {
        super.myNgOnInit(() => this.initConfigs());
    }

    initConfigs() {
        this.allRoundsByNumber = this.structureService.getAllRoundsByNumber();
        this.planningService = new PlanningService(this.structureService);
        this.changeRoundNumber(this.structureService.getFirstRound().getNumber());
        this.processing = false;
    }

    changeRoundNumber(roundNumber: number) {
        this.selectedRoundNumber = roundNumber;
        this.modelConfig = cloneDeep(this.getFirstRoundOfRoundNumber(this.selectedRoundNumber).getConfig());
        this.modelRecreate = false;
        this.modelReschedule = false;
        this.setAlert('info', 'instellingen gelden ook voor volgende ronden');
        if (this.planningService.isStarted(this.selectedRoundNumber)) {
            this.setAlert('info', 'deze ronde is al begonnen, kies een andere ronde');
        }
    }

    getFirstRoundOfRoundNumber(roundNumber): Round {
        return this.allRoundsByNumber[this.selectedRoundNumber][0];
    }

    getClassPostfix(winnersOrLosers: number): string {
        return winnersOrLosers === Round.WINNERS ? 'success' : (winnersOrLosers === Round.LOSERS ? 'danger' : '');
    }

    setNrOfHeadtoheadMatches(nrOfHeadtoheadMatches) {
        if (nrOfHeadtoheadMatches < this.validations.minNrOfHeadtoheadMatches
            || nrOfHeadtoheadMatches > this.validations.maxNrOfHeadtoheadMatches) {
            return;
        }
        this.modelConfig.setNrOfHeadtoheadMatches(nrOfHeadtoheadMatches);
        this.modelRecreate = true; // this.planningService.create( this.selectedRoundNumber );
    }

    setWinPoints(winPoints) {
        if (winPoints < this.validations.minWinPoints
            || winPoints > this.validations.maxWinPoints) {
            return;
        }
        this.modelConfig.setWinPoints(winPoints);
    }


    setDrawPoints(drawPoints) {
        if (drawPoints < this.validations.minDrawPoints
            || drawPoints > this.validations.maxDrawPoints) {
            return;
        }
        this.modelConfig.setDrawPoints(drawPoints);
    }

    setHasExtension(hasExtension) {
        if (hasExtension !== true && hasExtension !== false) {
            return;
        }
        this.modelConfig.setHasExtension(hasExtension);
        this.modelReschedule = true;  // this.tournament.reschedule(new PlanningService(this.structureService), this.selectedRoundNumber);
    }

    setWinPointsExt(winPointsExt) {
        if (winPointsExt < this.validations.minWinPoints
            || winPointsExt > this.validations.maxWinPoints) {
            return;
        }
        this.modelConfig.setWinPointsExt(winPointsExt);
    }

    setDrawPointsExt(drawPointsExt) {
        if (drawPointsExt < this.validations.minDrawPoints
            || drawPointsExt > this.validations.maxDrawPoints) {
            return;
        }
        this.modelConfig.setDrawPointsExt(drawPointsExt);
    }

    setMinutesPerGameExt(minutesPerGameExt) {
        if (minutesPerGameExt < this.validations.minMinutesPerGame) {
            minutesPerGameExt = this.validations.minMinutesPerGame;
        } else if (minutesPerGameExt > this.validations.maxMinutesPerGame) {
            minutesPerGameExt = this.validations.maxMinutesPerGame;
        }
        if (minutesPerGameExt === this.modelConfig.getMinutesPerGame()) {
            return;
        }
        this.modelConfig.setMinutesPerGameExt(minutesPerGameExt);
        if (this.modelConfig.getEnableTime()) {
            this.modelReschedule = true;
        }
    }

    setMinutesPerGame(minutesPerGame) {
        if (minutesPerGame < this.validations.minMinutesPerGame) {
            minutesPerGame = this.validations.minMinutesPerGame;
        } else if (minutesPerGame > this.validations.maxMinutesPerGame) {
            minutesPerGame = this.validations.maxMinutesPerGame;
        }
        if (minutesPerGame === this.modelConfig.getMinutesPerGame()) {
            return;
        }
        this.modelConfig.setMinutesPerGame(minutesPerGame);
        if (this.modelConfig.getEnableTime()) {
            this.modelReschedule = true;
        }
    }

    setMinutesBetweenGames(minutesBetweenGames) {
        if (minutesBetweenGames < this.validations.minMinutesPerGame
            || minutesBetweenGames > this.validations.maxMinutesPerGame) {
            const avg = Math.floor(this.modelConfig.getMinutesPerGame() / 2);
            this.modelConfig.setMinutesBetweenGames(avg);
            return;
        }
        this.modelConfig.setMinutesBetweenGames(minutesBetweenGames);
        if (this.modelConfig.getEnableTime()) {
            this.modelReschedule = true;
            // this.tournament.reschedule(new PlanningService(this.structureService), this.selectedRoundNumber);
        }
    }

    setMinutesInBetween(minutesInBetween) {
        this.modelConfig.setMinutesInBetween(minutesInBetween);
        if (this.modelConfig.getEnableTime()) {
            this.modelReschedule = true;
            // this.tournament.reschedule(new PlanningService(this.structureService), this.selectedRoundNumber);
        }
    }

    setEnableTime(enableTime) {
        if (enableTime !== true && enableTime !== false) {
            return;
        }
        if (this.modelConfig.getEnableTime() === false && enableTime === true) {
            if (this.modelConfig.getMinutesPerGame() === 0) {
                this.modelConfig.setMinutesPerGame(this.roundConfigService.getDefaultMinutesPerGame());
            }
            if (this.modelConfig.getMinutesInBetween() === 0) {
                this.modelConfig.setMinutesInBetween(this.roundConfigService.getDefaultMinutesInBetween());
            }
        }
        this.modelConfig.setEnableTime(enableTime);
        this.modelReschedule = true; // this.tournament.reschedule(new PlanningService(this.structureService), this.selectedRoundNumber);
    }

    getDirectionDescription(scoreConfig) {
        return RoundConfigScore.getDirectionDescription(scoreConfig.getDirection());
    }

    setScoreConfigMaximum(scoreConfig: RoundConfigScore, scoreConfigMaximum) {
        if (scoreConfigMaximum > 9999 || scoreConfigMaximum < 0) {
            return;
        }
        if (scoreConfigMaximum === 0 && scoreConfig.getParent() !== undefined) {
            this.setScoreConfigMaximum(scoreConfig.getParent(), 0);
        }
        scoreConfig.setMaximum(scoreConfigMaximum);
    }

    isScoreConfigReadOnly(scoreConfig: RoundConfigScore) {
        if (scoreConfig.getChild() !== undefined && scoreConfig.getChild().getMaximum() === 0) {
            return true;
        }
        if (this.modelConfig.getEnableTime() && scoreConfig.getParent() === undefined) {
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

    getInputScoreConfig(): RoundConfigScore {
        const round = this.getFirstRoundOfRoundNumber(this.selectedRoundNumber);
        let scoreConfig: RoundConfigScore = round.getConfig().getScore().getRoot();
        while (scoreConfig && scoreConfig.getMaximum() === 0) {
            scoreConfig = scoreConfig.getChild();
        }
        if (scoreConfig === undefined) {
            scoreConfig = round.getConfig().getScore().getRoot();
        }
        return scoreConfig;
    }

    saveConfig() {
        this.setAlert('info', 'instellingen worden opgeslagen');
        this.processing = true;

        const jsonConfig = this.roundConfigRepository.objectToJsonHelper(this.modelConfig);
        const rounds = this.allRoundsByNumber[this.selectedRoundNumber];
        return this.roundConfigRepository.editObject(this.structureService.getCompetition(), this.selectedRoundNumber, jsonConfig)
            .subscribe(
                /* happy path */ res => {
                    this.updateRoundConfig(this.selectedRoundNumber, this.modelConfig);
                    const tournamentService = new TournamentService(this.tournament);
                    if (this.modelRecreate === true) {
                        tournamentService.create(this.planningService, this.selectedRoundNumber);
                        this.planningRepository.createObject(rounds)
                            .subscribe(
                                /* happy path */ gamesRes => {
                                    this.setAlert('success', 'de instellingen zijn opgeslagen');
                                },
                                /* error path */ e => {
                                    this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e); this.processing = false;
                                },
                                /* onComplete */() => this.processing = false
                            );
                    } else if (this.modelReschedule) {
                        tournamentService.reschedule(this.planningService, this.selectedRoundNumber);
                        this.planningRepository.editObject(rounds)
                            .subscribe(
                                /* happy path */ gamesRes => {
                                    this.setAlert('success', 'de instellingen zijn opgeslagen');
                                },
                                /* error path */ e => {
                                    this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e); this.processing = false;
                                },
                                    /* onComplete */() => this.processing = false
                            );
                    } else {
                        this.processing = false;
                        this.setAlert('success', 'de instellingen zijn opgeslagen');
                    }
                },
                /* error path */ e => {
                    this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e);
                    this.processing = false;
                } // ,
                // /* onComplete */() => /*this.processing = false*/
            );

    }

    protected updateRoundConfig(roundNumber: number, modelToUpdateWith: RoundConfig) {
        const rounds = this.allRoundsByNumber[roundNumber];
        rounds.forEach(round => {
            round.getConfig().setQualifyRule(modelToUpdateWith.getQualifyRule());
            round.getConfig().setNrOfHeadtoheadMatches(modelToUpdateWith.getNrOfHeadtoheadMatches());
            round.getConfig().setWinPoints(modelToUpdateWith.getWinPoints());
            round.getConfig().setDrawPoints(modelToUpdateWith.getDrawPoints());
            round.getConfig().setHasExtension(modelToUpdateWith.getHasExtension());
            round.getConfig().setWinPointsExt(modelToUpdateWith.getWinPointsExt());
            round.getConfig().setDrawPointsExt(modelToUpdateWith.getDrawPointsExt());
            round.getConfig().setMinutesPerGameExt(modelToUpdateWith.getMinutesPerGameExt());
            round.getConfig().setEnableTime(modelToUpdateWith.getEnableTime());
            round.getConfig().setMinutesPerGame(modelToUpdateWith.getMinutesPerGame());
            round.getConfig().setMinutesBetweenGames(modelToUpdateWith.getMinutesBetweenGames());
            round.getConfig().setMinutesInBetween(modelToUpdateWith.getMinutesInBetween());
            this.updateRoundConfigScore(round.getConfig().getScore(), modelToUpdateWith.getScore());
        });
        if (this.allRoundsByNumber[roundNumber + 1] !== undefined) {
            this.updateRoundConfig(roundNumber + 1, modelToUpdateWith);
        }
    }

    protected updateRoundConfigScore(roundConfigScore: RoundConfigScore, modelToUpdateWith: RoundConfigScore) {
        roundConfigScore.setMaximum(modelToUpdateWith.getMaximum());
        if (roundConfigScore.getParent() && modelToUpdateWith.getParent()) {
            this.updateRoundConfigScore(roundConfigScore.getParent(), modelToUpdateWith.getParent());
        }
    }

    // dit is idem als get position
    // protected getWinnersLosers(firstRound: Round, aChildRound: Round): number[] {
    //     const winnersLosers: number[] = [];
    //     while (aChildRound !== firstRound) {
    //         winnersLosers.push(aChildRound.getWinnersOrLosers());
    //         aChildRound = aChildRound.getParent();
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

    getDirectionClass(scoreConfig: RoundConfigScore) {
        return scoreConfig.getDirection() === RoundConfigScore.UPWARDS ? 'naar' : 'vanaf';
    }
}
