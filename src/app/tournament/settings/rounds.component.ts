import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import {
    NameService,
    PlanningRepository,
    PlanningService,
    RoundNumber,
    SportConfig,
    SportConfigMapper,
    SportConfigRepository,
    SportScoreConfig,
    StructureRepository,
} from 'ngx-sport';

import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-rounds-settings',
    templateUrl: './rounds.component.html',
    styleUrls: ['./rounds.component.css']
})
export class RoundsSettingsComponent extends TournamentComponent implements OnInit {
    // category: number;
    // categories: IRoundConfigCategories = {
    //     qualification: 1,
    //     gameunits: 2,
    //     planning: 3, // let op : wordt gelinkt vanuit referees
    // };

    // enableTime: boolean;
    // ranges: any = {};
    // roundNumber: RoundNumber;
    // modelConfig: Config;
    // modelRecreate: boolean;
    // modelReschedule: boolean;
    // customForm: FormGroup;
    // validations: any = {
    //     minNrOfHeadtoheadMatches: 1,
    //     maxNrOfHeadtoheadMatches: 4,
    //     minWinPoints: 1,
    //     maxWinPoints: 10,
    //     minDrawPoints: 0,
    //     maxDrawPoints: 5,
    //     minMinutesPerGame: 0,
    //     maxMinutesPerGame: 60,
    // };
    // planningService: PlanningService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        private configRepository: SportConfigRepository,
        private configMapper: SportConfigMapper,
        public nameService: NameService,
        private myNavigation: MyNavigation,
        private planningRepository: PlanningRepository
    ) {
        super(route, router, tournamentRepository, sructureRepository);
    }

    // private initRanges() {
    //     this.ranges.nrOfHeadtoheadMatches = [];
    //     for (let i = this.validations.minNrOfHeadtoheadMatches; i <= this.validations.maxNrOfHeadtoheadMatches; i++) {
    //         this.ranges.nrOfHeadtoheadMatches.push(i);
    //     }
    // }

    ngOnInit() {
        // this.route.params.subscribe(params => {
        //     super.myNgOnInit(() => this.initConfigs(+params.roundNumber));
        // });
        // this.route.queryParamMap.subscribe(params => {
        //     if (params.get('category') !== null) {
        //         this.category = +params.get('category');
        //     }
        // });
    }

    // initConfigs(roundNumberAsValue: number) {
    //     this.planningService = new PlanningService(this.tournament.getCompetition());
    //     const roundNumber = this.structure.getRoundNumber(roundNumberAsValue);
    //     this.changeRoundNumber(roundNumber);
    //     this.initRanges();
    //     this.processing = false;
    // }

    // changeRoundNumber(roundNumber: RoundNumber) {
    //     this.roundNumber = roundNumber;
    //     this.modelConfig = cloneDeep(this.roundNumber.getConfig());
    //     this.toggleExtension(true);
    //     this.modelRecreate = false;
    //     this.modelReschedule = false;
    //     this.setAlert('info', 'instellingen gelden ook voor volgende ronden');
    //     if (this.planningService.isStarted(this.roundNumber)) {
    //         this.setAlert('info', 'deze ronde heeft al gespeelde wedstrijden, kies een andere ronde');
    //     }
    // }

    // toggleExtension(fromHasExtension: boolean) {
    //     if (fromHasExtension === true) {
    //         if (this.modelConfig.getHasExtension() === false) {
    //             this.modelConfig.setMinutesPerGameExt(0);
    //         } else if (this.modelConfig.getMinutesPerGameExt() === 0) {
    //             this.modelConfig.setMinutesPerGameExt(this.configService.getDefaultMinutesPerGameExt());
    //         }
    //     } else {
    //         this.modelConfig.setHasExtension(this.modelConfig.getMinutesPerGameExt() > 0);
    //     }
    // }

    // setNrOfHeadtoheadMatches(nrOfHeadtoheadMatchesAsString: string) {
    //     const nrOfHeadtoheadMatches = +nrOfHeadtoheadMatchesAsString;
    //     if (nrOfHeadtoheadMatches < this.validations.minNrOfHeadtoheadMatches
    //         || nrOfHeadtoheadMatches > this.validations.maxNrOfHeadtoheadMatches) {
    //         return;
    //     }
    //     this.modelConfig.setNrOfHeadtoheadMatches(nrOfHeadtoheadMatches);
    //     this.modelRecreate = true; // this.planningService.create( this.roundNumber );
    // }

    // setWinPoints(winPointsAsString: string) {
    //     const winPoints = +winPointsAsString;
    //     if (winPoints < this.validations.minWinPoints
    //         || winPoints > this.validations.maxWinPoints) {
    //         return;
    //     }
    //     this.modelConfig.setWinPoints(winPoints);
    // }

    // setDrawPoints(drawPointsAsString: string) {
    //     const drawPoints = +drawPointsAsString;
    //     if (drawPoints < this.validations.minDrawPoints
    //         || drawPoints > this.validations.maxDrawPoints) {
    //         return;
    //     }
    //     this.modelConfig.setDrawPoints(drawPoints);
    // }

    // setHasExtension(hasExtension) {
    //     if (hasExtension !== true && hasExtension !== false) {
    //         return;
    //     }
    //     this.modelConfig.setHasExtension(hasExtension);
    //     this.toggleExtension(true);
    //     this.modelReschedule = true;  // this.tournament.reschedule(new PlanningService(this.structureService), this.roundNumber);
    // }

    // setWinPointsExt(winPointsExtAsString: string) {
    //     const winPointsExt = +winPointsExtAsString;
    //     if (winPointsExt < this.validations.minWinPoints
    //         || winPointsExt > this.validations.maxWinPoints) {
    //         return;
    //     }
    //     this.modelConfig.setWinPointsExt(winPointsExt);
    // }

    // setDrawPointsExt(drawPointsExtAsString: string) {
    //     const drawPointsExt = +drawPointsExtAsString;
    //     if (drawPointsExt < this.validations.minDrawPoints
    //         || drawPointsExt > this.validations.maxDrawPoints) {
    //         return;
    //     }
    //     this.modelConfig.setDrawPointsExt(drawPointsExt);
    // }

    // setMinutesPerGameExt(minutesPerGameExt) {
    //     if (minutesPerGameExt < this.validations.minMinutesPerGame) {
    //         minutesPerGameExt = this.validations.minMinutesPerGame;
    //     } else if (minutesPerGameExt > this.validations.maxMinutesPerGame) {
    //         minutesPerGameExt = this.validations.maxMinutesPerGame;
    //     }
    //     if (minutesPerGameExt === this.modelConfig.getMinutesPerGame()) {
    //         return;
    //     }
    //     this.modelConfig.setMinutesPerGameExt(minutesPerGameExt);
    //     this.toggleExtension(false);
    //     if (this.modelConfig.getEnableTime()) {
    //         this.modelReschedule = true;
    //     }
    // }

    // setMinutesPerGame(minutesPerGame) {
    //     if (minutesPerGame < this.validations.minMinutesPerGame) {
    //         minutesPerGame = this.validations.minMinutesPerGame;
    //     } else if (minutesPerGame > this.validations.maxMinutesPerGame) {
    //         minutesPerGame = this.validations.maxMinutesPerGame;
    //     }
    //     if (minutesPerGame === this.modelConfig.getMinutesPerGame()) {
    //         return;
    //     }
    //     this.modelConfig.setMinutesPerGame(minutesPerGame);
    //     if (this.modelConfig.getEnableTime()) {
    //         this.modelReschedule = true;
    //     }
    // }

    // setMinutesBetweenGames(minutesBetweenGames) {
    //     if (minutesBetweenGames < this.validations.minMinutesPerGame
    //         || minutesBetweenGames > this.validations.maxMinutesPerGame) {
    //         const avg = Math.floor(this.modelConfig.getMinutesPerGame() / 2);
    //         this.modelConfig.setMinutesBetweenGames(avg);
    //         return;
    //     }
    //     this.modelConfig.setMinutesBetweenGames(minutesBetweenGames);
    //     if (this.modelConfig.getEnableTime()) {
    //         this.modelReschedule = true;
    //         // this.tournament.reschedule(new PlanningService(this.structureService), this.roundNumber);
    //     }
    // }

    // setMinutesAfter(minutesAfter) {
    //     this.modelConfig.setMinutesAfter(minutesAfter);
    //     if (this.modelConfig.getEnableTime()) {
    //         this.modelReschedule = true;
    //         // this.tournament.reschedule(new PlanningService(this.structureService), this.roundNumber);
    //     }
    // }

    // setEnableTime(enableTime) {
    //     if (enableTime !== true && enableTime !== false) {
    //         return;
    //     }
    //     if (this.modelConfig.getEnableTime() === false && enableTime === true) {
    //         if (this.modelConfig.getMinutesPerGame() === 0) {
    //             this.modelConfig.setMinutesPerGame(this.configService.getDefaultMinutesPerGame());
    //         }
    //         if (this.modelConfig.getMinutesBetweenGames() === 0) {
    //             this.modelConfig.setMinutesBetweenGames(this.configService.getDefaultMinutesBetweenGames());
    //         }
    //         if (this.modelConfig.getMinutesAfter() === 0) {
    //             this.modelConfig.setMinutesAfter(this.configService.getDefaultMinutesAfter());
    //         }
    //     }
    //     this.modelConfig.setEnableTime(enableTime);
    //     this.modelReschedule = true; // this.tournament.reschedule(new PlanningService(this.structureService), this.roundNumber);
    // }

    // getDirectionDescription(scoreConfig) {
    //     return SportScoreConfig.getDirectionDescription(scoreConfig.getDirection());
    // }

    // setScoreConfigMaximum(scoreConfig: SportScoreConfig, scoreConfigMaximum) {
    //     if (scoreConfigMaximum > 9999 || scoreConfigMaximum < 0) {
    //         return;
    //     }
    //     if (scoreConfigMaximum === 0 && scoreConfig.getParent() !== undefined) {
    //         this.setScoreConfigMaximum(scoreConfig.getParent(), 0);
    //     }
    //     scoreConfig.setMaximum(scoreConfigMaximum);
    // }

    // setTeamup(teamUp: boolean) {
    //     // const drawPoints = +drawPointsAsString;
    //     // if (drawPoints < this.validations.minDrawPoints
    //     //     || drawPoints > this.validations.maxDrawPoints) {
    //     //     return;
    //     // }

    //     this.modelReschedule = true;
    //     this.modelRecreate = true;
    //     this.modelConfig.setTeamup(teamUp);
    // }

    // setSelfReferee(selfReferee: boolean) {
    //     this.modelReschedule = true;
    //     this.modelConfig.setSelfReferee(selfReferee);
    // }

    // isScoreConfigReadOnly(scoreConfig: SportScoreConfig) {
    //     if (scoreConfig.getChild() !== undefined && scoreConfig.getChild().getMaximum() === 0) {
    //         return true;
    //     }
    //     if (this.modelConfig.getEnableTime() && scoreConfig.getParent() === undefined) {
    //         return true;
    //     }
    //     return false;
    // }

    // canSportBeDoneTeamup(): boolean {
    //     const sport = this.tournament.getCompetition().getLeague().getSport();
    //     return this.configService.canSportBeDoneTeamup(sport);
    // }

    // getSelectRoundNumberButtonClassPostfix(roundNumber: RoundNumber) {
    //     if (roundNumber >= this.roundNumber) {
    //         return 'primary';
    //     }
    //     return 'secondary';
    // }

    // saveConfig() {
    //     this.setAlert('info', 'instellingen worden opgeslagen');
    //     this.processing = true;

    //     // hier kijken als round of roundnumber is
    //     const jsonConfig = this.configMapper.toJson(this.modelConfig);
    //     return this.configRepository.editObject(this.roundNumber, jsonConfig)
    //         .subscribe(
    //             /* happy path */ configsRes => {
    //                 const tournamentService = new TournamentService(this.tournament);
    //                 if (this.modelRecreate === true) {
    //                     tournamentService.create(this.planningService, this.roundNumber);
    //                     this.planningRepository.createObject(this.roundNumber)
    //                         .subscribe(
    //                             /* happy path */ gamesRes => {
    //                                 this.setAlert('success', 'de instellingen zijn opgeslagen');
    //                             },
    //                             /* error path */ e => {
    //                                 this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e); this.processing = false;
    //                             },
    //                             /* onComplete */() => this.processing = false
    //                         );
    //                 } else if (this.modelReschedule) {
    //                     tournamentService.reschedule(this.planningService, this.roundNumber);
    //                     this.planningRepository.editObject(this.roundNumber)
    //                         .subscribe(
    //                             /* happy path */ gamesRes => {
    //                                 this.setAlert('success', 'de instellingen zijn opgeslagen');
    //                             },
    //                             /* error path */ e => {
    //                                 this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e); this.processing = false;
    //                             },
    //                                 /* onComplete */() => this.processing = false
    //                         );
    //                 } else {
    //                     this.processing = false;
    //                     this.setAlert('success', 'de instellingen zijn opgeslagen');
    //                 }
    //             },
    //             /* error path */ e => {
    //                 this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e);
    //                 this.processing = false;
    //             } // ,
    //             // /* onComplete */() => /*this.processing = false*/
    //         );

    // }

    // getDirectionName(scoreConfig: SportScoreConfig) {
    //     return scoreConfig.getDirection() === SportScoreConfig.UPWARDS ? 'naar' : 'vanaf';
    // }

    // navigateBack() {
    //     this.myNavigation.back();
    // }
}

interface IRoundConfigCategories {
    qualification: number;
    gameunits: number;
    planning: number;
}
