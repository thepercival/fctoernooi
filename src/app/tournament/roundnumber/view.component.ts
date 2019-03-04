import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { Game, NameService, PlanningService, Poule, Ranking, RoundNumber } from 'ngx-sport';

import { AuthService } from '../../auth/auth.service';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { Role } from '../../lib/role';
import { Tournament } from '../../lib/tournament';

@Component({
  selector: 'app-tournament-roundnumber-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class TournamentRoundNumberViewComponent implements OnInit, AfterViewInit {

  @Input() tournament: Tournament;
  @Input() roundNumber: RoundNumber;
  @Input() planningService: PlanningService;
  @Input() parentReturnAction: string;
  @Input() scrollTo: IPlanningScrollTo;
  @Input() userRefereeId: number;
  @Input() canEditSettings: boolean;
  @Output() popOverIsOpen = new EventEmitter<boolean>(); // kan misschien uit
  alert: any;
  GameStatePlayed = Game.STATE_PLAYED;
  sameDay = true;
  previousGameStartDateTime: Date;
  ranking: Ranking;
  userIsGameResultAdmin: boolean;
  favorites: Favorites;
  gamesToShow: Game[];

  constructor(
    private router: Router,
    private authService: AuthService,
    private scrollService: ScrollToService,
    public nameService: NameService,
    public favRepository: FavoritesRepository) {
    // this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
    this.ranking = new Ranking(Ranking.RULESSET_WC);
  }


  ngOnInit() {
    this.userIsGameResultAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.GAMERESULTADMIN);
    this.favorites = this.favRepository.getItem(this.tournament);
    this.gamesToShow = this.planningService.getGamesForRoundNumber(this.roundNumber, Game.ORDER_RESOURCEBATCH).filter(game => {
      return !this.favorites.hasItems() || this.favorites.hasGameItem(game) || !this.hasAGamePoulePlaceACompetitor(game);
    });
    this.sameDay = this.gamesToShow.length > 1 ? this.isSameDay(this.gamesToShow[0], this.gamesToShow[this.gamesToShow.length - 1]) : true;
    console.log('planningview oninit end', new Date());
  }

  ngAfterViewInit() {
    if (this.scrollTo.roundNumber === this.roundNumber.getNumber()) {
      console.log('planningview scrolling to scroll-' + (!this.roundNumber.isFirst() ? 'roundnumber-' + this.roundNumber.getNumber() : 'game-' + this.scrollTo.gameId), new Date());
      this.scrollService.scrollTo({
        target: 'scroll-' + (this.scrollTo.gameId === undefined ? 'roundnumber-' + this.roundNumber.getNumber() : 'game-' + this.scrollTo.gameId),
        duration: 0/*,
        easing: 'easeInOutQuint'*/
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

  isBreakBeforeGame(game: Game): boolean {
    if (!this.tournament.hasBreak()) {
      return false;
    }
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

  hasAGamePoulePlaceACompetitor(game: Game): boolean {
    return game.getPoulePlaces().some(gamePoulePlace => gamePoulePlace.getPoulePlace().getCompetitor() !== undefined);
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
    return this.tournament.getCompetition().getReferees().length > 0 || this.roundNumber.getConfig().getSelfReferee();
  }

  showPouleRanking(popOver: NgbPopover, poule: Poule) {
    if (popOver.isOpen()) {
      popOver.close();
    } else {
      const tournament = this.tournament;
      popOver.open({ poule, tournament });
    }
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

  protected resetAlert(): void {
    this.alert = undefined;
  }

  protected setAlert(type: string, message: string): boolean {
    this.alert = { 'type': type, 'message': message };
    return (type === 'success');
  }

  pouleHasPopover(game: Game): boolean {
    return game.getPoule().needsRanking() || (game.getRound().getParent() !== undefined && this.hasAGamePoulePlaceACompetitor(game));
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
