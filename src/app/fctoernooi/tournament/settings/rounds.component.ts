import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import {
    PlanningRepository,
    PlanningService,
    Round,
    RoundNumber,
    RoundNumberConfig,
    RoundNumberConfigRepository,
    RoundNumberConfigScore,
    RoundNumberConfigService,
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
    category: number;
    categories: IRoundConfigCategories = {
        qualification: 1,
        gameunits: 2,
        planning: 3,
    };

    enableTime: boolean;
    ranges: any = {};
    roundNumber: RoundNumber;
    modelConfig: RoundNumberConfig;
    configService: RoundNumberConfigService;
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

    returnUrl: string;
    returnUrlParam: number;
    returnUrlQueryParamKey: string;
    returnUrlQueryParamValue: string;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        private configRepository: RoundNumberConfigRepository,
        public nameService: StructureNameService,
        private planningRepository: PlanningRepository
    ) {
        super(route, router, tournamentRepository, sructureRepository);
        this.initRanges();
        this.configService = new RoundNumberConfigService();
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
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.initConfigs(+params.roundNumber));
        });
        this.route.queryParamMap.subscribe(params => {
            this.returnUrl = params.get('returnAction');
            this.returnUrlParam = +params.get('returnParam');
            this.returnUrlQueryParamKey = params.get('returnQueryParamKey');
            this.returnUrlQueryParamValue = params.get('returnQueryParamValue');
        });
    }

    initConfigs(roundNumberAsValue: number) {
        this.planningService = new PlanningService(this.tournament.getCompetition());
        const roundNumber = this.structure.getRoundNumber(roundNumberAsValue);
        this.changeRoundNumber(roundNumber);
        this.processing = false;
    }

    canChangeMinutesAfter(roundNumber: RoundNumber): boolean {
        return roundNumber.getNext() !== undefined && this.planningService.hasGames(roundNumber.getNext());
    }

    changeRoundNumber(roundNumber: RoundNumber) {
        this.roundNumber = roundNumber;
        this.category = undefined;
        this.modelConfig = cloneDeep(this.roundNumber.getConfig());
        this.toggleExtension(true);
        this.modelRecreate = false;
        this.modelReschedule = false;
        this.setAlert('info', 'instellingen gelden ook voor volgende ronden');
        if (this.planningService.isStarted(this.roundNumber)) {
            this.setAlert('info', 'deze ronde is al begonnen, kies een andere ronde');
        }
    }

    toggleExtension(fromHasExtension: boolean) {
        if (fromHasExtension === true) {
            if (this.modelConfig.getHasExtension() === false) {
                this.modelConfig.setMinutesPerGameExt(0);
            } else if (this.modelConfig.getMinutesPerGameExt() === 0) {
                this.modelConfig.setMinutesPerGameExt(this.configService.getDefaultMinutesPerGameExt());
            }
        } else {
            this.modelConfig.setHasExtension(this.modelConfig.getMinutesPerGameExt() > 0);
        }
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
        this.modelRecreate = true; // this.planningService.create( this.roundNumber );
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
        this.toggleExtension(true);
        this.modelReschedule = true;  // this.tournament.reschedule(new PlanningService(this.structureService), this.roundNumber);
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
        this.toggleExtension(false);
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
            // this.tournament.reschedule(new PlanningService(this.structureService), this.roundNumber);
        }
    }

    setMinutesAfter(minutesAfter) {
        this.modelConfig.setMinutesAfter(minutesAfter);
        if (this.modelConfig.getEnableTime()) {
            this.modelReschedule = true;
            // this.tournament.reschedule(new PlanningService(this.structureService), this.roundNumber);
        }
    }

    setEnableTime(enableTime) {
        if (enableTime !== true && enableTime !== false) {
            return;
        }
        if (this.modelConfig.getEnableTime() === false && enableTime === true) {
            if (this.modelConfig.getMinutesPerGame() === 0) {
                this.modelConfig.setMinutesPerGame(this.configService.getDefaultMinutesPerGame());
            }
            if (this.modelConfig.getMinutesBetweenGames() === 0) {
                this.modelConfig.setMinutesBetweenGames(this.configService.getDefaultMinutesBetweenGames());
            }
            if (this.modelConfig.getMinutesAfter() === 0) {
                this.modelConfig.setMinutesAfter(this.configService.getDefaultMinutesAfter());
            }
        }
        this.modelConfig.setEnableTime(enableTime);
        this.modelReschedule = true; // this.tournament.reschedule(new PlanningService(this.structureService), this.roundNumber);
    }

    getDirectionDescription(scoreConfig) {
        return RoundNumberConfigScore.getDirectionDescription(scoreConfig.getDirection());
    }

    setScoreConfigMaximum(scoreConfig: RoundNumberConfigScore, scoreConfigMaximum) {
        if (scoreConfigMaximum > 9999 || scoreConfigMaximum < 0) {
            return;
        }
        if (scoreConfigMaximum === 0 && scoreConfig.getParent() !== undefined) {
            this.setScoreConfigMaximum(scoreConfig.getParent(), 0);
        }
        scoreConfig.setMaximum(scoreConfigMaximum);
    }

    isScoreConfigReadOnly(scoreConfig: RoundNumberConfigScore) {
        if (scoreConfig.getChild() !== undefined && scoreConfig.getChild().getMaximum() === 0) {
            return true;
        }
        if (this.modelConfig.getEnableTime() && scoreConfig.getParent() === undefined) {
            return true;
        }
        if (this.planningService.isStarted(this.roundNumber)) {
            return true;
        }
        return false;
    }

    getSelectRoundNumberButtonClassPostfix(roundNumber: RoundNumber) {
        if (roundNumber >= this.roundNumber) {
            return 'primary';
        }
        return 'secondary';
    }

    saveConfig() {
        this.setAlert('info', 'instellingen worden opgeslagen');
        this.processing = true;

        // hier kijken als round of roundnumber is
        const jsonConfig = this.configRepository.objectToJson(this.modelConfig);
        return this.configRepository.editObject(this.roundNumber, jsonConfig)
            .subscribe(
                /* happy path */ res => {
                    this.updateRoundConfig(this.roundNumber, this.modelConfig);
                    const tournamentService = new TournamentService(this.tournament);
                    if (this.modelRecreate === true) {
                        tournamentService.create(this.planningService, this.roundNumber);
                        this.planningRepository.createObject(this.roundNumber.getRounds())
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
                        tournamentService.reschedule(this.planningService, this.roundNumber);
                        this.planningRepository.editObject(this.roundNumber.getRounds())
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

    protected updateRoundConfig(roundNumber: RoundNumber, modelToUpdateWith: RoundNumberConfig) {

        roundNumber.getConfig().setQualifyRule(modelToUpdateWith.getQualifyRule());
        roundNumber.getConfig().setNrOfHeadtoheadMatches(modelToUpdateWith.getNrOfHeadtoheadMatches());
        roundNumber.getConfig().setWinPoints(modelToUpdateWith.getWinPoints());
        roundNumber.getConfig().setDrawPoints(modelToUpdateWith.getDrawPoints());
        roundNumber.getConfig().setHasExtension(modelToUpdateWith.getHasExtension());
        roundNumber.getConfig().setWinPointsExt(modelToUpdateWith.getWinPointsExt());
        roundNumber.getConfig().setDrawPointsExt(modelToUpdateWith.getDrawPointsExt());
        roundNumber.getConfig().setMinutesPerGameExt(modelToUpdateWith.getMinutesPerGameExt());
        roundNumber.getConfig().setEnableTime(modelToUpdateWith.getEnableTime());
        roundNumber.getConfig().setMinutesPerGame(modelToUpdateWith.getMinutesPerGame());
        roundNumber.getConfig().setMinutesBetweenGames(modelToUpdateWith.getMinutesBetweenGames());
        roundNumber.getConfig().setMinutesAfter(modelToUpdateWith.getMinutesAfter());
        this.updateRoundConfigScore(roundNumber.getConfig().getScore(), modelToUpdateWith.getScore());

        if (roundNumber.getNext() !== undefined) {
            this.updateRoundConfig(roundNumber.getNext(), modelToUpdateWith);
        }
    }

    protected updateRoundConfigScore(roundConfigScore: RoundNumberConfigScore, modelToUpdateWith: RoundNumberConfigScore) {
        roundConfigScore.setMaximum(modelToUpdateWith.getMaximum());
        if (roundConfigScore.getParent() && modelToUpdateWith.getParent()) {
            this.updateRoundConfigScore(roundConfigScore.getParent(), modelToUpdateWith.getParent());
        }
    }

    // dit is idem als get position
    // protected getWinnersLosers(rootRound: Round, aChildRound: Round): number[] {
    //     const winnersLosers: number[] = [];
    //     while (aChildRound !== rootRound) {
    //         winnersLosers.push(aChildRound.getWinnersOrLosers());
    //         aChildRound = aChildRound.getParent();
    //     }
    //     return winnersLosers;
    // }

    // protected getRoundByWinnersLosers(rootRound: Round, winnersLosers: number[]): Round {
    //     let round: Round = rootRound;
    //     while (winnersLosers.length > 0) {
    //         round = round.getChildRound(winnersLosers.pop());
    //     }
    //     return round;
    // }

    getDirectionClass(scoreConfig: RoundNumberConfigScore) {
        return scoreConfig.getDirection() === RoundNumberConfigScore.UPWARDS ? 'naar' : 'vanaf';
    }

    private getForwarUrl() {
        return [this.returnUrl, this.returnUrlParam];
    }

    private getForwarUrlQueryParams(): {} {
        const queryParams = {};
        if (this.returnUrlQueryParamKey !== undefined) {
            queryParams[this.returnUrlQueryParamKey] = this.returnUrlQueryParamValue;
        }
        return queryParams;

    }

    navigateBack() {
        this.router.navigate(this.getForwarUrl(), { queryParams: this.getForwarUrlQueryParams() });
    }
}

interface IRoundConfigCategories {
    qualification: number;
    gameunits: number;
    planning: number;
}
