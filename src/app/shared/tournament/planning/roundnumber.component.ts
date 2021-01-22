import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Game,
  NameService,
  Poule,
  RoundNumber,
  ScoreConfigService,
  State,
  Round,
  PlanningConfig,
  ScoreConfig,
  PlaceLocationMap,
  Place,
  Period,
  AgainstGame,
  SelfReferee
} from 'ngx-sport';

import { AuthService } from '../../../lib/auth/auth.service';
import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../../lib/favorites';
import { Role } from '../../../lib/role';
import { Tournament } from '../../../lib/tournament';
import { PlanningRepository } from '../../../lib/ngx-sport/planning/repository';
import { PouleRankingModalComponent } from '../poulerankingmodal/rankingmodal.component';
import { TranslateService } from '../../../lib/translate';
import { CompetitionSportRouter } from '../competitionSport.router';
import { CompetitionSportTabOrder } from '../competitionSportTabOrder';

@Component({
  selector: 'app-tournament-roundnumber-planning',
  templateUrl: './roundnumber.component.html',
  styleUrls: ['./roundnumber.component.scss']
})
export class RoundNumberPlanningComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() tournament: Tournament;
  @Input() roundNumber: RoundNumber;
  @Input() userRefereeId: number;
  @Input() reload: boolean;
  @Input() roles: number;
  @Input() favorites: Favorites;
  @Input() refreshingData: boolean;
  @Output() refreshData = new EventEmitter();
  @Output() scroll = new EventEmitter();
  alert: any;
  sameDay = true;
  tournamentBreak: Period;
  breakShown: boolean;
  userIsAdmin: boolean;
  gameOrder = Game.Order_By_Batch;
  filterEnabled = false;
  hasReferees: boolean;
  hasBegun: boolean;
  tournamentHasBegun: boolean;
  gameDatas: GameData[];
  private ScoreConfigService: ScoreConfigService;
  needsRanking: boolean;
  hasMultiplePoules: boolean;
  planningConfig: PlanningConfig;
  translate = new TranslateService();
  private placeLocationMap: PlaceLocationMap;
  nameService: NameService;

  constructor(
    private router: Router,
    public competitionSportRouter: CompetitionSportRouter,
    private authService: AuthService,
    public cssService: CSSService,
    private modalService: NgbModal,
    protected planningRepository: PlanningRepository) {
    // this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
    this.ScoreConfigService = new ScoreConfigService();
  }

  ngOnInit() {
    this.translate = new TranslateService();
    this.placeLocationMap = new PlaceLocationMap(this.tournament.getCompetitors());
    this.nameService = new NameService(this.placeLocationMap);
    this.tournamentBreak = this.tournament.getBreak();
    this.planningConfig = this.roundNumber.getValidPlanningConfig();
    this.userIsAdmin = this.tournament.getUser(this.authService.getUser())?.hasRoles(Role.ADMIN);
    this.needsRanking = this.roundNumber.needsRanking();
    this.hasMultiplePoules = this.roundNumber.getPoules().length > 1;
    this.hasReferees = this.tournament.getCompetition().getReferees().length > 0
      || this.planningConfig.getSelfReferee() !== SelfReferee.Disabled;
    this.hasBegun = this.roundNumber.hasBegun();
    this.tournamentHasBegun = this.roundNumber.getFirst().hasBegun();
    this.reloadGameData();
  }

  ngAfterViewInit() {
    if (this.roundNumber.getNext() === undefined) {
      this.scroll.emit();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.reload && changes.reload.currentValue !== changes.reload.previousValue && changes.reload.currentValue !== undefined) {
      if (this.gameDatas.length === 0) {
        this.reloadGameData();
      }
    }
  }

  private reloadGameData() {
    this.gameDatas = this.getGameData();
    this.sameDay = this.gameDatas.length > 1 ? this.isSameDay(this.gameDatas[0], this.gameDatas[this.gameDatas.length - 1]) : true;
  }

  get GameHOME(): boolean { return AgainstGame.Home; }
  get GameAWAY(): boolean { return AgainstGame.Away; }
  get SportConfigTabFields(): number { return CompetitionSportTabOrder.Fields; }
  get SportConfigTabScore(): number { return CompetitionSportTabOrder.Score; }

  private getGameData() {
    const gameDatas: GameData[] = [];
    const pouleDatas = this.getPouleDatas();
    this.roundNumber.getGames(this.gameOrder).forEach(game => {
      const aPlaceHasACompetitor = this.hasAPlaceACompetitor(game);
      if (this.filterEnabled && this.favorites?.hasItems() && !this.favorites?.hasGameItem(game)) {
        return;
      }
      const pouleData: PouleData = pouleDatas[game.getPoule().getId()];

      const gameData: GameData = {
        canChangeResult: this.canChangeResult(game),
        hasACompetitor: aPlaceHasACompetitor,
        poule: pouleData,
        hasPopover: pouleData.needsRanking || (!this.roundNumber.isFirst() && aPlaceHasACompetitor),
        game: game,
        showBreak: this.isBreakBeforeGame(game)
      };
      gameDatas.push(gameData);
    });
    return gameDatas;
  }

  toggleFilter() {
    this.filterEnabled = !this.filterEnabled;
    this.reloadGameData();
  }

  private getPouleDatas(): any {
    const pouleDatas = {};

    this.roundNumber.getPoules().forEach(poule => {
      pouleDatas[poule.getId()] = {
        name: this.nameService.getPouleName(poule, false),
        needsRanking: poule.needsRanking(),
        round: poule.getRound()
      };
    });
    return pouleDatas;
  }

  getScore(game: Game): string {
    // TODOSPORT
    return '';
    // const sScore = ' - ';
    // if (game.getState() !== State.Finished) {
    //   return sScore;
    // }
    // const finalScore = this.ScoreConfigService.getFinalScore(game);
    // if (finalScore === undefined) {
    //   return sScore;
    // }
    // return finalScore.getHome() + sScore + finalScore.getAway();
  }

  getScoreFinalPhase(game: Game): string {
    // TODOSPORT
    // return game.getFinalPhase() === Game.Phase_ExtraTime ? '*' : '';
    return '';
  }

  isPlayed(game: Game): boolean {
    return game.getState() === State.Finished;
  }

  canChangeResult(game: Game): boolean {
    if (this.hasRole(Role.GAMERESULTADMIN)) {
      return true;
    }
    if (game.getReferee() === undefined) {
      return false;
    }
    return this.hasRole(Role.REFEREE) && this.userRefereeId === game.getReferee().getId();
  }

  hasAdminRole(): boolean {
    return this.hasRole(Role.ADMIN);
  }

  canFilter(): boolean {
    return !this.hasRole(Role.ADMIN + Role.GAMERESULTADMIN);
  }

  protected hasRole(role: number): boolean {
    return (this.roles & role) === role;
  }
  protected isBreakBeforeGame(game: Game): boolean {
    if (this.tournamentBreak === undefined || this.breakShown || !this.planningConfig.getEnableTime() || !this.gameOrder) {
      return false;
    }
    this.breakShown = game.getStartDateTime().getTime() === this.tournamentBreak.getEndDateTime().getTime();
    return this.breakShown;
  }

  getCompetitor(place: Place) {
    return this.placeLocationMap.getCompetitor(place.getStartLocation());
  }

  private hasCompetitor(place: Place): boolean {
    return this.getCompetitor(place) === undefined;
  }

  hasAPlaceACompetitor(game: Game): boolean {
    return game.getPlaces().some(gamePlace => this.hasCompetitor(gamePlace.getPlace()));
  }

  linkToGameEdit(game: Game) {
    this.router.navigate(['/admin/game', this.tournament.getId(), game.getId()]);
  }

  linkToPlanningConfig() {
    this.router.navigate(['/admin/planningconfig', this.tournament.getId(), this.roundNumber.getNumber()]);
  }

  linkToSportConfig(tabOrder: CompetitionSportTabOrder) {
    this.competitionSportRouter.navigate(this.tournament, tabOrder, this.roundNumber);
  }

  linkToReferee() {
    this.router.navigate(['/admin/referees', this.tournament.getId()]);
  }

  showPouleRanking(popOver: NgbPopover, poule: Poule) {
    if (popOver.isOpen()) {
      popOver.close();
    } else {
      const tournament = this.tournament;
      popOver.open({ poule, tournament });
    }
  }

  sortGames() {
    this.gameOrder = this.gameOrder ? undefined : Game.Order_By_Batch;
    this.reloadGameData();
  }

  protected isSameDay(gameDataOne: GameData, gameDataTwo: GameData): boolean {
    const gameOne = gameDataOne.game;
    const gameTwo = gameDataTwo.game;
    const dateOne: Date = gameOne.getStartDateTime();
    const dateTwo: Date = gameTwo.getStartDateTime();
    if (dateOne === undefined && dateTwo === undefined) {
      return true;
    }
    return (dateOne.getDate() === dateTwo.getDate()
      && dateOne.getMonth() === dateTwo.getMonth()
      && dateOne.getFullYear() === dateTwo.getFullYear());
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  protected setAlert(type: string, message: string): boolean {
    this.alert = { 'type': type, 'message': message };
    return (type === 'success');
  }

  getGameQualificationDescription(game: Game): string {
    // TODOSPORT
    // return this.nameService.getPlacesFromName(game.getPlaces(AgainstGame.Home), false, true)
    //   + ' - ' + this.nameService.getPlacesFromName(game.getPlaces(AgainstGame.Away), false, true);
    return '';
  }

  openModalPouleRank(poule: Poule) {
    const modalRef = this.modalService.open(PouleRankingModalComponent);
    modalRef.componentInstance.poule = poule;
    modalRef.componentInstance.tournament = this.tournament;
  }

  openModal(templateRef) {
    const modalRef = this.modalService.open(templateRef);
  }
}

interface GameData {
  canChangeResult: boolean;
  hasACompetitor: boolean;
  poule: PouleData;
  hasPopover: boolean;
  game: Game;
  showBreak?: boolean;
}

interface PouleData {
  name: string;
  needsRanking: boolean;
  round: Round;
}
