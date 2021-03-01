import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, RankedRoundItem, RankingService, PlaceLocationMap, GameMode, ScoreConfig } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../../lib/favorites';

@Component({
  selector: 'app-tournament-pouleranking-against-table',
  templateUrl: './pouleagainst.component.html',
  styleUrls: ['./pouleagainst.component.scss']
})
export class PouleRankingAgainstComponent implements OnInit {
  @Input() poule!: Poule;
  @Input() favorites!: Favorites;
  @Input() placeLocationMap!: PlaceLocationMap;
  @Input() rankingService!: RankingService;
  @Input() header!: boolean;
  public rankingItems!: RankedRoundItem[];

  public nameService!: NameService;
  public showDifferenceDetail = false;
  public processing = true;

  constructor(
    public cssService: CSSService
  ) {
  }

  ngOnInit() {
    this.processing = true;
    this.nameService = new NameService(this.placeLocationMap);
    this.rankingItems = this.rankingService.getItemsForPoule(this.poule);
    this.processing = false;
  }

  useSubScore() {
    return this.poule.getRound().getValidScoreConfigs().some((scoreConfig: ScoreConfig) => {
      return scoreConfig.useSubScore();
    });
  }

  getQualifyPlaceClass(rankingItem: RankedRoundItem): string {
    const place = this.poule.getPlace(rankingItem.getUniqueRank());
    return place ? this.cssService.getQualifyPlace(place) : '';
  }
}
