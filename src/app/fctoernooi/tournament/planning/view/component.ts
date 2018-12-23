import { AfterViewInit, Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap/popover/popover';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import {
  Game,
  PlanningService,
  Poule,
  PoulePlace,
  Ranking,
  RankingItem,
  Referee,
  Round,
  RoundNumber,
  NameService,
  Team,
} from 'ngx-sport';

import { AuthService } from '../../../../auth/auth.service';
import { Tournament } from '../../../tournament';
import { TournamentRole } from '../../role';

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
    this.userIsGameResultAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(), TournamentRole.GAMERESULTADMIN);
  }

  ngAfterViewInit() {
    if (this.scrollTo.roundNumber === this.roundNumber.getNumber()) {
      this.scrollService.scrollTo({
        target: 'scroll-' + (!this.roundNumber.isFirst() ? 'roundnumber-' + this.roundNumber.getNumber() : 'game-' + this.scrollTo.gameId),
        duration: 200
      });
    }
  }

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

  getPoulePlaceClass(poulePlace: PoulePlace): string {
    if (poulePlace.getTeam() === undefined || poulePlace.getTeam().getAbbreviation() === undefined) {
      return '';
    }
    return 'd-none d-sm-inline';
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
    if (this.tournament.hasRole(loggedInUserId, TournamentRole.GAMERESULTADMIN)) {
      return true;
    }
    if (game.getReferee() === undefined) {
      return false;
    }
    if (this.userRefereeId !== undefined
      && this.tournament.hasRole(loggedInUserId, TournamentRole.REFEREE)
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
    const x = this.hasGameFavTeamIds(game)
      || ((game.getReferee() === undefined && this.hasGameTeams(game) && !this.hasFavTeamIds()) || this.isRefereeFav(game.getReferee()));
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

  hasGameTeams(game: Game): boolean {
    return game.getHomePoulePlace().getTeam() !== undefined && game.getAwayPoulePlace().getTeam() !== undefined;
  }

  hasGameFavTeamIds(game: Game): boolean {
    return (this.isTeamFav(game.getHomePoulePlace().getTeam()) || this.isTeamFav(game.getAwayPoulePlace().getTeam()));
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
    return (delta > 0 ? '+' : (delta < 0 ? '-' : '')) + delta;
  }



  getDifferenceDetail(poulePlace: PoulePlace, games: Game[], sub: boolean) {
    const nrOfUnitsScored = this.ranking.getNrOfUnitsScored(poulePlace, games, sub);
    const nrOfUnitsReceived = this.ranking.getNrOfUnitsReceived(poulePlace, games, sub);
    const delta = nrOfUnitsScored - nrOfUnitsReceived;
    return '( ' + nrOfUnitsScored + ' - ' + nrOfUnitsReceived + ' )';
  }

  hasMultipleScoreConfigs() {
    return this.selectedPouleForRanking.getRound().getConfig().getCalculateScore()
      !== this.selectedPouleForRanking.getRound().getConfig().getInputScore();
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
    return game.getPoule().needsRanking() ||
      (game.getRound().getParent() !== undefined &&
        (game.getHomePoulePlace().getTeam() !== undefined || game.getAwayPoulePlace().getTeam() !== undefined)
      );
  }

  getGameQualificationDescription(game: Game) {
    return this.nameService.getPoulePlaceFromName(game.getHomePoulePlace()) + ' - ' +
      this.nameService.getPoulePlaceFromName(game.getAwayPoulePlace());
  }
}

export interface IPlanningScrollTo {
  roundNumber?: number;
  gameId?: number;
}
