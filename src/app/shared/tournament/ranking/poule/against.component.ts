import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, CompetitorMap, ScoreConfig, AgainstSportRoundRankingCalculator, CompetitionSport, RankedSportRoundItem } from 'ngx-sport';
import { Favorites } from '../../../../lib/favorites';
import { CSSService } from '../../../common/cssservice';


@Component({
  selector: 'app-tournament-pouleranking-against-table',
  templateUrl: './against.component.html',
  styleUrls: ['./against.component.scss']
})
export class PouleRankingAgainstComponent implements OnInit {
  @Input() poule!: Poule;
  @Input() favorites!: Favorites;
  @Input() competitorMap!: CompetitorMap;
  @Input() header!: boolean;
  protected rankingCalculator!: AgainstSportRoundRankingCalculator;
  public competitionSport!: CompetitionSport;
  public rankingItems!: RankedSportRoundItem[];
  public nameService!: NameService;
  public showDifferenceDetail = false;
  public processing = true;

  constructor(
    public cssService: CSSService
  ) {
  }

  ngOnInit() {
    this.processing = true;
    this.nameService = new NameService(this.competitorMap);
    this.competitionSport = this.poule.getCompetition().getSingleSport();
    this.rankingCalculator = new AgainstSportRoundRankingCalculator(this.competitionSport);
    this.rankingItems = this.rankingCalculator.getItemsForPoule(this.poule);
    this.processing = false;
  }

  useSubScore() {
    return this.poule.getRound().getValidScoreConfigs().some((scoreConfig: ScoreConfig) => {
      return scoreConfig.useSubScore();
    });
  }

  getQualifyPlaceClass(rankingItem: RankedSportRoundItem): string {
    const place = this.poule.getPlace(rankingItem.getUniqueRank());
    return place ? this.cssService.getQualifyPlace(place) : '';
  }
}
