import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, CompetitorMap, ScoreConfig, RoundRankingCalculator, RankedRoundItem } from 'ngx-sport';

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
  @Input() competitorMap!: CompetitorMap;
  @Input() header!: boolean;
  protected roundRankingCalculator: RoundRankingCalculator;
  public rankingItems!: RankedRoundItem[];
  public nameService!: NameService;
  public showDifferenceDetail = false;
  public processing = true;

  constructor(
    public cssService: CSSService
  ) {
    this.roundRankingCalculator = new RoundRankingCalculator();
  }

  ngOnInit() {
    this.processing = true;
    this.nameService = new NameService(this.competitorMap);
    this.rankingItems = this.roundRankingCalculator.getItemsForPoule(this.poule);
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
