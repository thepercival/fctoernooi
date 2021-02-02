import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, RankedRoundItem, RankingService, PlaceLocationMap, GameMode } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../../lib/favorites';
import { FavoritesRepository } from '../../../lib/favorites/repository';
import { Tournament } from '../../../lib/tournament';

@Component({
  selector: 'app-tournament-pouleranking-against',
  templateUrl: './pouleagainst.component.html',
  styleUrls: ['./pouleagainst.component.scss']
})
export class PouleRankingAgainstComponent implements OnInit {
  public rankingItems: RankedRoundItem[];
  @Input() poule: Poule;
  @Input() tournament: Tournament;
  @Input() header: boolean;
  public placeLocationMap: PlaceLocationMap;
  public nameService: NameService;
  public showDifferenceDetail = false;
  favorites: Favorites;
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
    const ranking = new RankingService(GameMode.Against, this.tournament.getCompetition().getRankingRuleSet());
    this.rankingItems = ranking.getItemsForPoule(this.poule);
    this.processing = false;
  }

  // useSubScore() {
  //   return this.poule.getRound().getNumber().getValidScoreConfigs().some(scoreConfig => {
  //     return scoreConfig.useSubScore();
  //   });
  // }
}
