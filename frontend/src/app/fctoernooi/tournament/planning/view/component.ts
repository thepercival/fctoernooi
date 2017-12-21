import { Component, Input } from '@angular/core';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Router } from '@angular/router';
import { Game } from 'voetbaljs/game';
import { PlanningService } from 'voetbaljs/planning/service';
import { PoulePlace } from 'voetbaljs/pouleplace';
import { Round } from 'voetbaljs/round';
import { StructureService } from 'voetbaljs/structure/service';

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
  // public winnersAndLosers: number[];

  constructor(private router: Router) {
    // this.winnersAndLosers = [Round.WINNERS, Round.LOSERS];
    this.resetAlert();
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

  linkToGameEdit(tournament: Tournament, game: Game) {
    this.router.navigate(
      ['/toernooi/gameedit', tournament.getId(), game.getId()],
      { queryParams: { returnAction: '/toernooi/planning', returnParams: tournament.getId() } }
    );
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
