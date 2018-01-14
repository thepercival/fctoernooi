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
  @Input() round: Round;
  @Input() structureService: StructureService;
  alert: any;
  planningService: PlanningService;
  GameStatePlayed = Game.STATE_PLAYED;
  selectedPouleForRanking;
  private openPopovers: NgbPopover[] = [];
  ranking: Ranking;
  // public winnersAndLosers: number[];

  constructor(private router: Router) {
    // this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
    this.ranking = new Ranking(Ranking.RULESSET_WC);
  }

  ngOnInit() {
    this.planningService = new PlanningService(this.tournament.getCompetitionseason().getStartDateTime());
  }

  getWinnersLosersDescription(winnersOrLosers: number): string {
    const description = this.structureService.getWinnersLosersDescription(winnersOrLosers);
    return (description !== '' ? description + 's' : description);
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
    this.router.navigate(
      ['/toernooi/gameedit', tournament.getId(), game.getId()],
      { queryParams: { returnAction: '/toernooi/planning', returnParams: tournament.getId() } }
    );
  }

  showRanking(popOver: NgbPopover, poule: Poule) {
    this.openPopovers.forEach(openPopover => openPopover.close());
    const open = (!this.openPopovers.find(openPopover => openPopover === popOver));
    this.openPopovers = [];
    this.selectedPouleForRanking = poule;
    if (open === true) {
      popOver.open();
      this.openPopovers.push(popOver);
    }
    return false;
  }

  getPoulePlacesByRank(poule: Poule): PoulePlace[][] {
    const pp = this.ranking.getPoulePlacesByRank(poule.getPlaces(), poule.getGames());
    console.log(pp);
    return pp;
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
