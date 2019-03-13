import { Component, Input, OnInit } from '@angular/core';
import { Game, NameService, Poule, PoulePlace, Ranking, RankingItem, Round } from 'ngx-sport';

import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { Tournament } from '../../lib/tournament';

@Component({
  selector: 'app-tournament-pouleranking',
  templateUrl: './poule.component.html',
  styleUrls: ['./poule.component.scss']
})
export class TournamentPouleRankingComponent implements OnInit {
  public ranking: Ranking;
  public rankingItems: RankingItem[];
  @Input() poule: Poule;
  @Input() tournament: Tournament;
  public showDifferenceDetail = false;
  favorites: Favorites;
  public processing = true;

  constructor(
    public nameService: NameService,
    public favRepository: FavoritesRepository) {
    this.ranking = new Ranking(Ranking.RULESSET_WC);
  }

  ngOnInit() {
    this.favorites = this.favRepository.getItem(this.tournament);
    this.processing = true;
    this.rankingItems = this.ranking.getItems(this.poule.getPlaces(), this.poule.getGames())
    console.log('pouleRanking:ngOnInit()');
    this.processing = false;
  }

  getQualificationClass(poulePlaceNumber: number): {} {
    const poulePlace: PoulePlace = this.poule.getPlace(poulePlaceNumber);
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

  getClassPostfix(winnersOrLosers: number): string {
    return winnersOrLosers === Round.WINNERS ? 'success' : (winnersOrLosers === Round.LOSERS ? 'danger' : '');
  }


  hasMultipleScoreConfigs() {
    return this.poule.getRound().getNumber().getConfig().getCalculateScore()
      !== this.poule.getRound().getNumber().getConfig().getInputScore();
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
}