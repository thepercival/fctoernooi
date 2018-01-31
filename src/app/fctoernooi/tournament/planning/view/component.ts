import { AuthService } from '../../../../auth/auth.service';
import { TournamentRole } from '../../role';
import { Component, Input } from '@angular/core';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Router } from '@angular/router';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap/popover/popover';
import { Game, PlanningService, Poule, PoulePlace, Ranking, Round, StructureService } from 'ngx-sport';

import { Tournament } from '../../../tournament';

@Component({
  selector: 'app-tournament-planning-view',
  templateUrl: './component.html',
  styleUrls: ['./component.css']
})
export class TournamentPlanningViewComponent implements OnInit {

  @Input() tournament: Tournament;
  @Input() roundNumber: number;
  @Input() structureService: StructureService;
  @Input() parentReturnAction: string;
  alert: any;
  planningService: PlanningService;
  GameStatePlayed = Game.STATE_PLAYED;
  selectedPouleForRanking;
  private openPopovers: NgbPopover[] = [];
  ranking: Ranking;
  roundsByNumber: Round[];
  userIsGameResultAdmin: boolean;

  constructor(private router: Router, private authService: AuthService) {
    // this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
    this.ranking = new Ranking(Ranking.RULESSET_WC);
  }

  ngOnInit() {
    this.planningService = new PlanningService(this.structureService);
    const allRoundsByNumber = this.structureService.getAllRoundsByNumber();
    this.roundsByNumber = allRoundsByNumber[this.roundNumber];
    this.userIsGameResultAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(), TournamentRole.GAMERESULTADMIN);
    console.log(this.parentReturnAction);
  }

  getWinnersLosersDescription(winnersOrLosers: number): string {
    const description = this.structureService.getWinnersLosersDescription(winnersOrLosers);
    return (description !== '' ? description + 's' : description);
  }

  haveMultiplePoulePlaces(roundsByNumber: Round[]) {
    return roundsByNumber.some(round => round.getPoulePlaces().length > 1);
  }

  getClassPostfix(winnersOrLosers: number): string {
    return winnersOrLosers === Round.WINNERS ? 'success' : (winnersOrLosers === Round.LOSERS ? 'danger' : '');
  }

  getClassPostfixPoulePlace(poulePlace: PoulePlace): string {
    const rules = poulePlace.getToQualifyRules();
    if (rules.length === 2) {
      return 'warning';
    } else if (rules.length === 1) {
      const qualifyRule = rules[0];
      const singleColor = this.getClassPostfix(qualifyRule.getWinnersOrLosers());
      return qualifyRule.getFromPoulePlaces().length === qualifyRule.getToPoulePlaces().length ? singleColor : 'warning';
    }
    return 'not-qualifying';
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

  showRanking(popOver: NgbPopover, poule: Poule) {
    const popOverClosed = this.openPopovers.find(openPopover => openPopover === popOver) === undefined;
    this.openPopovers.forEach(openPopover => openPopover.close());
    this.openPopovers = [];
    this.selectedPouleForRanking = poule;
    if (popOverClosed === true) {
      popOver.open();
      this.openPopovers.push(popOver);
    }
    return false;
  }

  getGamesHelper(): Game[] {
    const games: Game[] = [];
    const gamesByNumber = this.planningService.getGamesByNumber(this.roundNumber);
    gamesByNumber.forEach(gamesIt => gamesIt.forEach(game => games.push(game)));
    return games;
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

}
