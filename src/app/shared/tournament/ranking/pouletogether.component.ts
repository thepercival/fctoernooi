import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, RankedRoundItem, RankingService, PlaceLocationMap, GameMode, GameAmountConfig } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../../lib/favorites';
import { FavoritesRepository } from '../../../lib/favorites/repository';
import { Tournament } from '../../../lib/tournament';

@Component({
  selector: 'app-tournament-pouleranking-together',
  templateUrl: './pouletogether.component.html',
  styleUrls: ['./pouletogether.component.scss']
})
export class PouleRankingTogetherComponent implements OnInit {
  public rankingItems: RankedRoundItem[];
  @Input() poule: Poule;
  @Input() tournament: Tournament;
  @Input() header: boolean;
  public placeLocationMap: PlaceLocationMap;
  public nameService: NameService;
  favorites: Favorites;
  gameAmountConfigs: GameAmountConfig[];
  public processing = true;

  constructor(
    public cssService: CSSService,
    public favRepository: FavoritesRepository) {
  }

  ngOnInit() {
    this.processing = true;
    this.placeLocationMap = new PlaceLocationMap(this.tournament.getCompetitors());
    this.nameService = new NameService(this.placeLocationMap);
    this.favorites = this.favRepository.getObject(this.tournament);
    const ranking = new RankingService(GameMode.Together, this.tournament.getCompetition().getRankingRuleSet());
    this.rankingItems = ranking.getItemsForPoule(this.poule);
    this.gameAmountConfigs = this.poule.getRound().getNumber().getValidGameAmountConfigs();
    this.processing = false;
  }


  // useSubScore() {
  //   return this.poule.getRound().getNumber().getValidScoreConfigs().some(scoreConfig => {
  //     return scoreConfig.useSubScore();
  //   });
  // }
}
