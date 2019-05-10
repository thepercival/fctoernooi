import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, PoulePlace, QualifyGroup, RankingService, RoundRankingItem } from 'ngx-sport';

import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { Tournament } from '../../lib/tournament';

@Component({
  selector: 'app-tournament-pouleranking',
  templateUrl: './poule.component.html',
  styleUrls: ['./poule.component.scss']
})
export class TournamentPouleRankingComponent implements OnInit {
  public rankingItems: RoundRankingItem[];
  @Input() poule: Poule;
  @Input() tournament: Tournament;
  public showDifferenceDetail = false;
  favorites: Favorites;
  public processing = true;

  constructor(
    public nameService: NameService,
    public favRepository: FavoritesRepository) {
  }

  ngOnInit() {
    this.processing = true;
    this.favorites = this.favRepository.getItem(this.tournament);
    const ranking = new RankingService(this.tournament.getCompetition().getRuleSet());
    this.rankingItems = ranking.getItemsForPoule(this.poule);
    this.processing = false;
  }

  getQualificationClass(poulePlaceNumber: number): {} {
    console.error("getQualificationClass");
    return {};
    // const poulePlace: PoulePlace = this.poule.getPlace(poulePlaceNumber);
    // const rules = poulePlace.getToQualifyRules();
    // if (rules.length === 2) {
    //   return { icon: 'circle', text: 'text-warning' };
    // } else if (rules.length === 1) {
    //   const qualifyRule = rules[0];
    //   const singleColor = this.getClassPostfix(qualifyRule.getWinnersOrLosers());
    //   return { icon: 'circle', text: 'text-' + (qualifyRule.isMultiple() ? 'warning' : singleColor) };
    // }
    // return { icon: undefined, text: '' };
  }

  getClassPostfix(winnersOrLosers: number): string {
    return winnersOrLosers === QualifyGroup.WINNERS ? 'success' : (winnersOrLosers === QualifyGroup.LOSERS ? 'danger' : '');
  }

  hasMultipleScoreConfigs() {
    return this.poule.getRound().getNumber().getConfig().getCalculateScore()
      !== this.poule.getRound().getNumber().getConfig().getInputScore();
  }

  getPoulePlace(rankingItem: RoundRankingItem): PoulePlace {
    return rankingItem.getRound().getPoulePlace(rankingItem.getPoulePlaceLocation());
  }
}