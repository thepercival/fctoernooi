import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, RankedRoundItem, RankingService, PlaceLocationMap } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../../lib/favorites';
import { FavoritesRepository } from '../../../lib/favorites/repository';
import { Tournament } from '../../../lib/tournament';

@Component({
  selector: 'app-tournament-pouleranking',
  templateUrl: './poule.component.html',
  styleUrls: ['./poule.component.scss']
})
export class PouleRankingComponent implements OnInit {
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
    // TODOSPORT
    // const ranking = new RankingService(this.tournament.getCompetition().getRuleSet());
    // this.rankingItems = ranking.getItemsForPoule(this.poule);
    this.processing = false;
  }

  // useSubScore() {
  //   return this.poule.getRound().getNumber().getValidScoreConfigs().some(scoreConfig => {
  //     return scoreConfig.useSubScore();
  //   });
  // }
}
