import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Game,
  NameService,
  Poule,
  RoundNumber,
  SportScoreConfigService,
  State,
  Round,
  PlanningConfig,
  PlanningPeriod,
  SportScoreConfig,
  Referee
} from 'ngx-sport';

import { AuthService } from '../../../lib/auth/auth.service';
import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../../lib/favorites';
import { Role } from '../../../lib/role';
import { Tournament } from '../../../lib/tournament';
import { PlanningRepository } from '../../../lib/ngx-sport/planning/repository';
import { PouleRankingModalComponent } from '../poulerankingmodal/rankingmodal.component';
import { TranslateService } from '../../../lib/translate';
import { SportConfigTabOrder } from '../sportconfigtaborder';
import { SportConfigRouter } from '../sportconfig.router';

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
  tournamentBreak: PlanningPeriod;
  breakShown: boolean;
  userIsAdmin: boolean;
  gameOrder = Game.ORDER_BY_BATCH;
  filterEnabled = false;
  hasReferees: boolean;
  hasBegun: boolean;
  tournamentHasBegun: boolean;
  gameDatas: GameData[];
  private sportScoreConfigService: SportScoreConfigService;
  needsRanking: boolean;
  hasMultiplePoules: boolean;
  planningConfig: PlanningConfig;
  translate = new TranslateService();

  constructor(
    private router: Router,
    public sportConfigRouter: SportConfigRouter,
    private authService: AuthService,
    public nameService: NameService,
    public cssService: CSSService,
    private modalService: NgbModal,
    protected planningRepository: PlanningRepository) {
    // this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
    this.sportScoreConfigService = new SportScoreConfigService();
  }

  ngOnInit() {
    this.translate = new TranslateService();
    this.tournamentBreak = this.tournament.getBreak();
    this.planningConfig = this.roundNumber.getValidPlanningConfig();
    this.userIsAdmin = this.tournament.getUser(this.authService.getUser())?.hasRoles(Role.ADMIN);
    this.needsRanking = this.roundNumber.needsRanking();
    this.hasMultiplePoules = this.roundNumber.getPoules().length > 1;
    this.hasReferees = this.tournament.getCompetition().getReferees().length > 0 || this.planningConfig.getSelfReferee();
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

  get GameHOME(): boolean { return Game.HOME; }
  get GameAWAY(): boolean { return Game.AWAY; }
  get SportConfigTabFields(): number { return SportConfigTabOrder.Fields; }
  get SportConfigTabScore(): number { return SportConfigTabOrder.Score; }

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
    const sScore = ' - ';
    if (game.getState() !== State.Finished) {
      return sScore;
    }
    const finalScore = this.sportScoreConfigService.getFinalScore(game);
    if (finalScore === undefined) {
      return sScore;
    }
    return finalScore.getHome() + sScore + finalScore.getAway();
  }

  getScoreFinalPhase(game: Game): string {
    return game.getFinalPhase() === Game.PHASE_EXTRATIME ? '*' : '';
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
    this.breakShown = game.getStartDateTime().getTime() === this.tournamentBreak.end.getTime();
    return this.breakShown;
  }

  hasAPlaceACompetitor(game: Game): boolean {
    return game.getPlaces().some(gamePlace => gamePlace.getPlace().getCompetitor() !== undefined);
  }

  linkToGameEdit(game: Game) {
    this.router.navigate(['/admin/game', this.tournament.getId(), game.getId()]);
  }

  linkToPlanningConfig() {
    this.router.navigate(['/admin/planningconfig', this.tournament.getId(), this.roundNumber.getNumber()]);
  }

  linkToSportConfig(tabOrder: SportConfigTabOrder) {
    this.sportConfigRouter.navigate(this.tournament, tabOrder, this.roundNumber);
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
    this.gameOrder = this.gameOrder ? undefined : Game.ORDER_BY_BATCH;
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

  getGameQualificationDescription(game: Game) {
    return this.nameService.getPlacesFromName(game.getPlaces(Game.HOME), false, true)
      + ' - ' + this.nameService.getPlacesFromName(game.getPlaces(Game.AWAY), false, true);
  }

  openModalPouleRank(poule: Poule) {
    const modalRef = this.modalService.open(PouleRankingModalComponent);
    modalRef.componentInstance.poule = poule;
    modalRef.componentInstance.tournament = this.tournament;
  }

  openModal(templateRef) {
    const modalRef = this.modalService.open(templateRef);
  }

  getCalculateName(scoreConfig: SportScoreConfig): string {
    const max = scoreConfig.getMaximum();
    const scoreConfigTmp = (max > 0) ? scoreConfig : scoreConfig.getNext();
    return this.translate.getScoreNamePlural(scoreConfigTmp);
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
