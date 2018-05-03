import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Router } from '@angular/router';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap/popover/popover';
import { ScrollToService } from 'ng2-scroll-to-el';
import { Game, PlanningService, Poule, PoulePlace, Ranking, Round, StructureNameService, StructureService } from 'ngx-sport';

import { AuthService } from '../../../../auth/auth.service';
import { Tournament } from '../../../tournament';
import { TournamentRole } from '../../role';

@Component({
  selector: 'app-tournament-planning-view',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class TournamentPlanningViewComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() tournament: Tournament;
  @Input() roundNumber: number;
  @Input() structureService: StructureService;
  @Input() planningService: PlanningService;
  @Input() parentReturnAction: string;
  @Input() scroll: boolean;
  @Output() popOverIsOpen = new EventEmitter<boolean>();
  alert: any;
  GameStatePlayed = Game.STATE_PLAYED;
  selectedPouleForRanking;
  sameDay = true;

  private openPopovers: NgbPopover[] = [];
  ranking: Ranking;
  roundsByNumber: Round[];
  userIsGameResultAdmin: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    private scrollService: ScrollToService,
    public nameService: StructureNameService) {
    // this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
    this.ranking = new Ranking(Ranking.RULESSET_WC);
  }

  ngOnInit() {
    this.userIsGameResultAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(), TournamentRole.GAMERESULTADMIN);
  }

  ngAfterViewInit() {
    if (this.scroll) {
      this.scrollService.scrollTo('#header-roundnumber-' + this.roundNumber);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.structureService !== undefined) {
      this.roundsByNumber = this.planningService.getRoundsByNumber(this.roundNumber);
    }
  }

  haveMultiplePoulePlaces(roundsByNumber: Round[]) {
    return roundsByNumber.some(round => round.getPoulePlaces().length > 1);
  }

  getClassPostfix(winnersOrLosers: number): string {
    return winnersOrLosers === Round.WINNERS ? 'success' : (winnersOrLosers === Round.LOSERS ? 'danger' : '');
  }

  getQualificationClass(poulePlace: PoulePlace): string {
    const rules = poulePlace.getToQualifyRules();
    if (rules.length === 2) {
      return 'fa fa-circle  text-warning';
    } else if (rules.length === 1) {
      const qualifyRule = rules[0];
      const singleColor = this.getClassPostfix(qualifyRule.getWinnersOrLosers());
      return 'fa fa-circle text-' + (qualifyRule.isMultiple() ? 'warning' : singleColor);
    }
    return '';
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
    return game.getFinalScore().getHome() + sScore + game.getFinalScore().getAway();
  }

  isPlayed(game: Game): boolean {
    return game.getState() === Game.STATE_PLAYED;
  }

  linkToGameEdit(tournament: Tournament, game: Game) {
    if (this.userIsGameResultAdmin !== true) {
      return;
    }
    this.router.navigate(
      ['/toernooi/gameedit', tournament.getId(), game.getId()],
      {
        queryParams: {
          returnAction: this.parentReturnAction,
          returnParam: tournament.getId()
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
      this.openPopovers.push(popOver);
    }
    this.popOverIsOpen.emit(popOverClosed);
    return false;
  }

  getGamesHelper(): Game[] {
    const games: Game[] = [];
    const gamesByNumber = this.planningService.getGamesByNumber(this.roundNumber, Game.ORDER_RESOURCEBATCH);
    gamesByNumber.forEach(gamesIt => gamesIt.forEach(game => games.push(game)));
    this.sameDay = games.length > 1 ? this.isSameDay(games[0], games[games.length - 1]) : true;
    return games;
  }

  onSameDay() {
    return this.sameDay;
  }

  aRoundNeedsRanking(roundsByNumber: Round[]): boolean {
    return roundsByNumber.some(round => round.needsRanking());
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

  getPoulePlacesByRank(poule: Poule): PoulePlace[][] {
    return this.ranking.getPoulePlacesByRank(poule.getPlaces(), poule.getGames());
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }


  protected setAlert(type: string, message: string): boolean {
    this.alert = { 'type': type, 'message': message };
    return (type === 'success');
  }

  public closeAlert(name: string) {
    this.alert = undefined;
  }

  getGoalDifference(poulePlace: PoulePlace, games: Game[]) {
    const nrOfGoalsScored = this.ranking.getNrOfGoalsScored(poulePlace, games);
    const nrOfGoalsReceived = this.ranking.getNrOfGoalsReceived(poulePlace, games);
    return (nrOfGoalsScored - nrOfGoalsReceived) + ' ( ' + nrOfGoalsScored + ' - ' + nrOfGoalsReceived + ' )';
  }
}
