import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import {
  Game,
  NameService,
  PlanningService,
  Poule,
  PoulePlace,
  Ranking,
  RankingItem,
  Referee,
  Round,
  RoundNumber,
  Team,
} from 'ngx-sport';

import { AuthService } from '../../../auth/auth.service';
import { Role } from '../../../lib/role';
import { Tournament } from '../../../lib/tournament';

@Component({
  selector: 'app-tournament-planning-view',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class TournamentPlanningViewComponent implements OnInit, AfterViewInit {

  @Input() tournament: Tournament;
  @Input() roundNumber: RoundNumber;
  @Input() planningService: PlanningService;
  @Input() parentReturnAction: string;
  @Input() favTeamIds: number[];
  @Input() favRefereeIds: number[];
  @Input() scrollTo: IPlanningScrollTo;
  @Input() userRefereeId: number;
  @Input() canEditSettings: boolean;
  @Output() popOverIsOpen = new EventEmitter<boolean>();
  alert: any;
  GameStatePlayed = Game.STATE_PLAYED;
  selectedPouleForRanking;
  sameDay = true;
  previousGameStartDateTime: Date;
  showDifferenceDetail: boolean;

  private openPopovers: NgbPopover[] = [];
  private rulesPopover: NgbPopover;
  ranking: Ranking;
  userIsGameResultAdmin: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    private scrollService: ScrollToService,
    public nameService: NameService) {
    // this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
    this.ranking = new Ranking(Ranking.RULESSET_WC);
  }

  ngOnInit() {
    this.userIsGameResultAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.GAMERESULTADMIN);
  }

  ngAfterViewInit() {
    if (this.scrollTo.roundNumber === this.roundNumber.getNumber()) {
      this.scrollService.scrollTo({
        target: 'scroll-' + (!this.roundNumber.isFirst() ? 'roundnumber-' + this.roundNumber.getNumber() : 'game-' + this.scrollTo.gameId),
        duration: 200
      });
    }
  }

  get GameHOME(): boolean { return Game.HOME; }
  get GameAWAY(): boolean { return Game.AWAY; }

  getGameTimeTooltipDescription() {
    const cfg = this.roundNumber.getConfig();
    let descr = 'De wedstrijden duren ' + cfg.getMinutesPerGame() + ' minuten. ';
    if (cfg.getHasExtension()) {
      descr += 'De eventuele verlenging duurt ' + cfg.getMinutesPerGameExt() + ' minuten. ';
    }
    descr += 'Er zit ' + cfg.getMinutesBetweenGames() + ' minuten tussen de wedstrijden.';
    return descr;
  }


  getClassPostfix(winnersOrLosers: number): string {
    return winnersOrLosers === Round.WINNERS ? 'success' : (winnersOrLosers === Round.LOSERS ? 'danger' : '');
  }

  getQualificationClass(poule: Poule, poulePlaceNumber: number): {} {
    const poulePlace: PoulePlace = poule.getPlace(poulePlaceNumber);
    const rules = poulePlace.getToQualifyRules();
    if (rules.length === 2) {
      return { icon: 'circle', text: 'text-warning' };
    } else if (rules.length === 1) {
      const qualifyRule = rules[0];
      const singleColor = this.getClassPostfix(qualifyRule.getWinnersOrLosers());
      return { icon: 'circle', text: 'text-' + (qualifyRule.isMultiple() ? 'warning' : singleColor) };
    }
    return { icon: undefined, text: '' };
  }

  getScore(game: Game): string {
    const sScore = ' - ';
    if (game.getState() !== Game.STATE_PLAYED) {
      return sScore;
    }
    const finalScore = game.getFinalScore();
    if (finalScore === undefined) {
      return sScore;
    }
    return finalScore.getHome() + sScore + finalScore.getAway();
  }

  isPlayed(game: Game): boolean {
    return game.getState() === Game.STATE_PLAYED;
  }

  hasEditPermissions(game: Game): boolean {
    const loggedInUserId = this.authService.getLoggedInUserId();
    if (this.tournament.hasRole(loggedInUserId, Role.GAMERESULTADMIN)) {
      return true;
    }
    if (game.getReferee() === undefined) {
      return false;
    }
    if (this.userRefereeId !== undefined
      && this.tournament.hasRole(loggedInUserId, Role.REFEREE)
      && this.userRefereeId === game.getReferee().getId()) {
      return true;
    }
    return false;
  }

  filterClass(): string {
    const hasFilter = (this.favTeamIds !== undefined && this.favTeamIds.length > 0)
      || (this.favRefereeIds !== undefined && this.favRefereeIds.length > 0 && this.hasReferees());
    return hasFilter ? 'primary' : 'secondary';
  }

  hasFavIds(): boolean {
    return this.hasFavTeamIds() || this.hasFavRefereeIds();
  }

  hasFavTeamIds(): boolean {
    return this.favTeamIds !== undefined && (this.favTeamIds.length > 0);
  }

  hasFavRefereeIds(): boolean {
    return this.favRefereeIds !== undefined && (this.favRefereeIds.length > 0);
  }

  hasGameFavIds(game: Game): boolean {
    const x = this.hasGameAFavTeamId(game)
      || ((game.getReferee() === undefined && this.haveAllGamePoulePlacesTeams(game) && !this.hasFavTeamIds()) || this.isRefereeFav(game.getReferee()));
    return x;
  }

  isBreakInBetween(game: Game) {
    if (this.previousGameStartDateTime === undefined) {
      if (game.getStartDateTime() !== undefined) {
        this.previousGameStartDateTime = new Date(game.getStartDateTime().getTime());
      }
      return false;
    }
    const cfg = this.roundNumber.getConfig();
    const newStartDateTime = new Date(this.previousGameStartDateTime.getTime());
    newStartDateTime.setMinutes(newStartDateTime.getMinutes() + cfg.getMaximalNrOfMinutesPerGame() + cfg.getMinutesBetweenGames());
    this.previousGameStartDateTime = new Date(game.getStartDateTime().getTime());
    return newStartDateTime < game.getStartDateTime();
  }

  haveAllGamePoulePlacesTeams(game: Game): boolean {
    return game.getPoulePlaces().every(gamePoulePlace => gamePoulePlace.getPoulePlace().getTeam() !== undefined);
  }

  hasAGamePoulePlaceATeam(game: Game): boolean {
    return game.getPoulePlaces().some(gamePoulePlace => gamePoulePlace.getPoulePlace().getTeam() !== undefined);
  }

  hasGameAFavTeamId(game: Game, homeaway: boolean = undefined): boolean {
    return game.getPoulePlaces(homeaway).some(gamePoulePlace => this.isTeamFav(gamePoulePlace.getPoulePlace().getTeam()));
  }

  isTeamFav(team: Team): boolean {
    // console.log('isTeamFav', team && this.favTeamIds && this.favTeamIds.some(favTeamId => favTeamId === team.getId()));
    return team && this.favTeamIds && this.favTeamIds.some(favTeamId => favTeamId === team.getId());
  }

  hasGameReferee(game: Game): boolean {
    return game.getReferee() !== undefined;
  }

  hasGameFavRefereeId(game: Game): boolean {
    return (this.isRefereeFav(game.getReferee()));
  }

  isRefereeFav(referee: Referee): boolean {
    return referee && this.favRefereeIds && this.favRefereeIds.some(favRefereeId => favRefereeId === referee.getId());
  }

  linkToGameEdit(game: Game) {
    this.router.navigate(
      ['/toernooi/gameedit', this.tournament.getId(), game.getId()],
      {
        queryParams: {
          returnAction: this.parentReturnAction,
          returnParam: this.tournament.getId()
        }
      }
    );
  }

  linkToRoundSettings() {
    this.router.navigate(
      ['/toernooi/roundssettings', this.tournament.getId(), this.roundNumber.getNumber()],
      {
        queryParams: {
          returnAction: this.parentReturnAction,
          returnParam: this.tournament.getId(),
          returnQueryParamKey: 'scrollToRoundNumber',
          returnQueryParamValue: this.roundNumber.getNumber()
        }
      }
    );
  }

  linkToFilterSettings() {
    this.router.navigate(
      ['/toernooi/filter', this.tournament.getId()],
      {
        queryParams: {
          returnQueryParamKey: 'scrollToRoundNumber',
          returnQueryParamValue: this.roundNumber.getNumber()
        }
      }
    );
  }

  hasFields() {
    return this.tournament.getCompetition().getFields().length > 0;
  }

  hasReferees() {
    return this.tournament.getCompetition().getReferees().length > 0;
  }

  showRanking(popOver: NgbPopover, poule: Poule) {
    const popOverClosed = this.openPopovers.find(openPopover => openPopover === popOver) === undefined;
    this.openPopovers.forEach(openPopover => openPopover.close());
    this.openPopovers = [];
    this.selectedPouleForRanking = poule;
    if (popOverClosed === true) {
      popOver.open();
      this.showDifferenceDetail = false;
      this.openPopovers.push(popOver);
    }
    this.popOverIsOpen.emit(popOverClosed);
    return false;
  }

  hideRanking() {
    this.openPopovers.forEach(openPopover => openPopover.close());
    this.openPopovers = [];
  }

  getGamesHelper(): Game[] {
    const games: Game[] = this.planningService.getGamesForRoundNumber(this.roundNumber, Game.ORDER_RESOURCEBATCH);
    this.sameDay = games.length > 1 ? this.isSameDay(games[0], games[games.length - 1]) : true;
    return games;
  }

  onSameDay() {
    return this.sameDay;
  }

  protected isSameDay(gameOne: Game, gameTwo: Game): boolean {
    const dateOne: Date = gameOne.getStartDateTime();
    const dateTwo: Date = gameTwo.getStartDateTime();
    if (dateOne === undefined && dateTwo === undefined) {
      return true;
    }
    return (dateOne.getDate() === dateTwo.getDate()
      && dateOne.getMonth() === dateTwo.getMonth()
      && dateOne.getFullYear() === dateTwo.getFullYear());
  }

  getRankingItems(poule: Poule): RankingItem[] {
    return this.ranking.getItems(poule.getPlaces(), poule.getGames());
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  protected setAlert(type: string, message: string): boolean {
    this.alert = { 'type': type, 'message': message };
    return (type === 'success');
  }

  getUnitDifference(poulePlace: PoulePlace, games: Game[]) {
    const nrOfUnitsScored = this.ranking.getNrOfUnitsScored(poulePlace, games);
    const nrOfUnitsReceived = this.ranking.getNrOfUnitsReceived(poulePlace, games);
    const delta = nrOfUnitsScored - nrOfUnitsReceived;
    return delta > 0 ? '+' + delta : delta;
  }

  getDifferenceDetail(poulePlace: PoulePlace, games: Game[], sub: boolean) {
    const nrOfUnitsScored = this.ranking.getNrOfUnitsScored(poulePlace, games, sub);
    const nrOfUnitsReceived = this.ranking.getNrOfUnitsReceived(poulePlace, games, sub);
    const delta = nrOfUnitsScored - nrOfUnitsReceived;
    return '( ' + nrOfUnitsScored + ' - ' + nrOfUnitsReceived + ' )';
  }

  hasMultipleScoreConfigs() {
    return this.selectedPouleForRanking.getRound().getNumber().getConfig().getCalculateScore()
      !== this.selectedPouleForRanking.getRound().getNumber().getConfig().getInputScore();
  }

  toggleRulesPopover(popOver?: NgbPopover) {
    if (popOver === undefined || this.rulesPopover !== undefined) {
      this.rulesPopover.close();
      this.rulesPopover = undefined;
    } else {
      this.rulesPopover = popOver;
      this.rulesPopover.open();
    }
  }

  pouleHasPopover(game: Game): boolean {
    return game.getPoule().needsRanking() || (game.getRound().getParent() !== undefined && this.hasAGamePoulePlaceATeam(game));
  }

  getGameQualificationDescription(game: Game) {
    return this.nameService.getPoulePlacesFromName(game.getPoulePlaces(Game.HOME), false, true)
      + ' - ' + this.nameService.getPoulePlacesFromName(game.getPoulePlaces(Game.AWAY), false, true);
  }
}

export interface IPlanningScrollTo {
  roundNumber?: number;
  gameId?: number;
}
