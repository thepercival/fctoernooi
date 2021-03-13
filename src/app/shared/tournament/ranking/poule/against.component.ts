import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, CompetitorMap, ScoreConfig, AgainstSportRoundRankingCalculator, CompetitionSport, SportRoundRankingItem } from 'ngx-sport';
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
  protected againstRankingCalculator!: AgainstSportRoundRankingCalculator;
  public competitionSport!: CompetitionSport;
  public sportRankingItems!: SportRoundRankingItem[];
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
    this.againstRankingCalculator = new AgainstSportRoundRankingCalculator(this.competitionSport);
    this.sportRankingItems = this.againstRankingCalculator.getItemsForPoule(this.poule);
    this.processing = false;
  }

  useSubScore() {
    return this.poule.getRound().getValidScoreConfigs().some((scoreConfig: ScoreConfig) => {
      return scoreConfig.useSubScore();
    });
  }

  getQualifyPlaceClass(rankingItem: SportRoundRankingItem): string {
    const place = this.poule.getPlace(rankingItem.getUniqueRank());
    return place ? this.cssService.getQualifyPlace(place) : '';
  }
}
