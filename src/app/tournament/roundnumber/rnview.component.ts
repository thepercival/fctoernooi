import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPopover, NgbModal, NgbModalConfig, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import {
  Game,
  NameService,
  Poule,
  RankingService,
  RoundNumber,
  SportScoreConfigService,
  State,
  Round,
  PlanningConfig,
  PlanningPeriod,
  SportScoreConfig
} from 'ngx-sport';

import { AuthService } from '../../auth/auth.service';
import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { Role } from '../../lib/role';
import { Tournament } from '../../lib/tournament';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { PouleRankingModalComponent } from '../poule/rankingmodal.component';
import { TranslateService } from '../../lib/translate';
import { enableDebugTools } from '@angular/platform-browser';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-tournament-roundnumber-view',
  templateUrl: './rnview.component.html',
  styleUrls: ['./rnview.component.scss']
})
export class TournamentRoundNumberViewComponent implements OnChanges, OnInit, AfterViewInit {

  @Input() tournament: Tournament;
  @Input() roundNumber: RoundNumber;
  @Input() reload: boolean;
  @Input() parentReturnAction: string;
  @Input() userRefereeId: number;
  @Input() canEditSettings: boolean;
  @Output() popOverIsOpen = new EventEmitter<boolean>();
  private nrOfOpenPopovers = 0;
  @Output() scroll = new EventEmitter<boolean>(); // kan misschien uit
  alert: any;
  sameDay = true;
  tournamentBreak: PlanningPeriod;
  userIsGameResultAdmin: boolean;
  favorites: Favorites;
  hasReferees: boolean;
  gameDatas: GameData[];
  private sportScoreConfigService: SportScoreConfigService;
  roundNumberNeedsRanking: boolean;
  planningConfig: PlanningConfig;
  translate = new TranslateService();

  constructor(
    private router: Router,
    private authService: AuthService,
    public nameService: NameService,
    public cssService: CSSService,
    private modalService: NgbModal,
    protected planningRepository: PlanningRepository,
    public favRepository: FavoritesRepository) {
    // this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
    this.sportScoreConfigService = new SportScoreConfigService();
  }

  ngOnInit() {
    this.translate = new TranslateService();
    this.tournamentBreak = this.tournament.getBreak();
    this.planningConfig = this.roundNumber.getValidPlanningConfig();
    this.userIsGameResultAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.GAMERESULTADMIN);
    this.favorites = this.favRepository.getItem(this.tournament);
    this.roundNumberNeedsRanking = this.roundNumber.needsRanking();
    this.hasReferees = this.tournament.getCompetition().getReferees().length > 0 || this.planningConfig.getSelfReferee();
    this.reloadGameData();
  }

  ngAfterViewInit() {
    if (this.roundNumber.getNext() === undefined) {
      this.scroll.emit(true);
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

  private getGameData() {
    const gameDatas: GameData[] = [];
    const pouleDatas = this.getPouleDatas();
    this.roundNumber.getGames(Game.ORDER_BY_BATCH).forEach(game => {
      const aPlaceHasACompetitor = this.hasAPlaceACompetitor(game);
      if (!(!this.favorites.hasItems() || this.favorites.hasGameItem(game) || !aPlaceHasACompetitor)) {
        return;
      }
      const pouleData: PouleData = pouleDatas[game.getPoule().getId()];
      const hasPopover = pouleData.needsRanking || (!this.roundNumber.isFirst() && aPlaceHasACompetitor);

      const gameData: GameData = {
        hasEditPermissions: this.hasEditPermissions(game),
        hasACompetitor: aPlaceHasACompetitor,
        hasPopover: hasPopover,
        poule: pouleData,
        game: game
      };
      gameDatas.push(gameData);
    });
    return gameDatas;
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
    const finalScore = this.sportScoreConfigService.getFinal(game);
    if (finalScore === undefined) {
      return sScore;
    }
    return finalScore.getHome() + sScore + finalScore.getAway();
  }

  isPlayed(game: Game): boolean {
    return game.getState() === State.Finished;
  }

  hasEditPermissions(game: Game): boolean {
    if (this.userIsGameResultAdmin) {
      return true;
    }
    if (game.getReferee() === undefined) {
      return false;
    }
    if (this.userRefereeId !== undefined
      && this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.REFEREE)
      && this.userRefereeId === game.getReferee().getId()) {
      return true;
    }
    return false;
  }

  isBreakBeforeGame(game: Game): boolean {
    if (this.tournamentBreak === undefined) {
      return false;
    }
    return game.getStartDateTime().getTime() === this.tournamentBreak.end.getTime();
  }

  hasAPlaceACompetitor(game: Game): boolean {
    return game.getPlaces().some(gamePlace => gamePlace.getPlace().getCompetitor() !== undefined);
  }

  linkToGameEdit(game: Game) {
    this.router.navigate(['/toernooi/gameedit', this.tournament.getId(), game.getId()]);
  }

  linkToPlanningConfig() {
    this.router.navigate(['/toernooi/planningconfig', this.tournament.getId(), this.roundNumber.getNumber()]);
  }

  linkToFilterSettings() {
    this.router.navigate(['/toernooi/filter', this.tournament.getId()]);
  }

  showPouleRanking(popOver: NgbPopover, poule: Poule) {
    if (popOver.isOpen()) {
      popOver.close();
    } else {
      const tournament = this.tournament;
      popOver.open({ poule, tournament });
    }
  }

  popoverShown() {
    this.nrOfOpenPopovers++;
    if (this.nrOfOpenPopovers !== 1) {
      return;
    }
    this.popOverIsOpen.emit(true);
  }

  popoverHidden() {
    this.nrOfOpenPopovers--;
    if (this.nrOfOpenPopovers !== 0) {
      return;
    }
    this.popOverIsOpen.emit(false);
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
    const modalRef = this.modalService.open(PouleRankingModalComponent, this.getModalOptions());
    modalRef.componentInstance.poule = poule;
    modalRef.componentInstance.tournament = this.tournament;
  }

  openModal(templateRef) {
    const modalRef = this.modalService.open(templateRef, this.getModalOptions());
  }

  getModalOptions(): NgbModalOptions {
    return {
      centered: true,
      scrollable: true,
      size: 'lg'
    };
  }

  getInputName(scoreConfig: SportScoreConfig): string {
    return '112';
    // const max = scoreConfig.getMaximum();
    // const maxNext = scoreConfig.hasNext() ? scoreConfig.getNext().getMaximum() : 0;
    // const scoreConfigTmp = (maxNext === 0 && max > 0) ? scoreConfig : scoreConfig.getNext();
    // return this.translate.getScoreNamePlural(getInput.getInput());
  }

  getCalculateName(scoreConfig: SportScoreConfig): string {
    const max = scoreConfig.getMaximum();
    const scoreConfigTmp = (max > 0) ? scoreConfig : scoreConfig.getNext();
    return this.translate.getScoreNamePlural(scoreConfigTmp);
  }
}

interface GameData {
  hasEditPermissions: boolean;
  hasACompetitor: boolean;
  hasPopover: boolean;
  poule: PouleData;
  game: Game;
}

interface PouleData {
  name: string;
  needsRanking: boolean;
  round: Round;
}
