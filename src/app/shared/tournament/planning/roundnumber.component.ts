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
  SportScoreConfig
} from 'ngx-sport';

import { AuthService } from '../../../lib/auth/auth.service';
import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../../lib/favorites';
import { FavoritesRepository } from '../../../lib/favorites/repository';
import { Role } from '../../../lib/role';
import { Tournament } from '../../../lib/tournament';
import { PlanningRepository } from '../../../lib/ngx-sport/planning/repository';
import { PouleRankingModalComponent } from '../poulerankingmodal/rankingmodal.component';
import { TranslateService } from '../../../lib/translate';

@Component({
  selector: 'app-tournament-roundnumber-planning',
  templateUrl: './roundnumber.component.html',
  styleUrls: ['./roundnumber.component.scss']
})
export class RoundNumberPlanningComponent implements OnChanges, OnInit, AfterViewInit {

  @Input() tournament: Tournament;
  @Input() roundNumber: RoundNumber;
  @Input() reload: boolean;
  @Input() userRefereeId: number;
  @Input() canEditSettings: boolean;
  @Input() refreshingData: boolean;
  @Output() refreshData = new EventEmitter();
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
    let showBreak = false;
    this.roundNumber.getGames(Game.ORDER_BY_BATCH).forEach(game => {
      const aPlaceHasACompetitor = this.hasAPlaceACompetitor(game);
      if (!(!this.favorites.hasItems() || this.favorites.hasGameItem(game) || !aPlaceHasACompetitor)) {
        return;
      }
      const pouleData: PouleData = pouleDatas[game.getPoule().getId()];
      const hasPopover = pouleData.needsRanking || (!this.roundNumber.isFirst() && aPlaceHasACompetitor);
      let showBreakIt;
      if (showBreak) {
        showBreakIt = false;
      } else {
        if (this.isBreakBeforeGame(game)) {
          showBreakIt = true;
          showBreak = true;
        }
      }

      const gameData: GameData = {
        hasEditPermissions: this.hasEditPermissions(game),
        hasACompetitor: aPlaceHasACompetitor,
        hasPopover: hasPopover,
        poule: pouleData,
        game: game,
        showBreak: showBreakIt
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

  protected isBreakBeforeGame(game: Game): boolean {
    if (this.tournamentBreak === undefined) {
      return false;
    }
    return game.getStartDateTime().getTime() === this.tournamentBreak.end.getTime();
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

  linkToFilterSettings() {
    this.router.navigate(['/public/filter', this.tournament.getId()]);
  }

  showPouleRanking(popOver: NgbPopover, poule: Poule) {
    if (popOver.isOpen()) {
      popOver.close();
    } else {
      const tournament = this.tournament;
      popOver.open({ poule, tournament });
    }
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
  hasEditPermissions: boolean;
  hasACompetitor: boolean;
  hasPopover: boolean;
  poule: PouleData;
  game: Game;
  showBreak?: boolean;
}

interface PouleData {
  name: string;
  needsRanking: boolean;
  round: Round;
}