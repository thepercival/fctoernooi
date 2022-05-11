import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, CompetitorMap, ScoreConfig, AgainstSportRoundRankingCalculator, CompetitionSport, SportRoundRankingItem } from 'ngx-sport';
import { Favorites } from '../../../../lib/favorites';
import { FavoritesRepository } from '../../../../lib/favorites/repository';
import { Tournament } from '../../../../lib/tournament';
import { CSSService } from '../../../common/cssservice';


@Component({
  selector: 'app-tournament-pouleranking-against-table',
  templateUrl: './against.component.html',
  styleUrls: ['./against.component.scss']
})
export class PouleRankingAgainstComponent implements OnInit {
  @Input() poule!: Poule;
  @Input() competitionSport!: CompetitionSport;
  @Input() tournament!: Tournament;
  @Input() competitorMap!: CompetitorMap;
  @Input() header!: boolean;
  public favorites!: Favorites;
  protected againstRankingCalculator!: AgainstSportRoundRankingCalculator;
  public sportRankingItems!: SportRoundRankingItem[];
  public nameService!: NameService;
  public showDifferenceDetail = false;
  public processing = true;

  constructor(
    public cssService: CSSService,
    public favRepos: FavoritesRepository) {
  }

  ngOnInit() {
    this.processing = true;
    this.nameService = new NameService(this.competitorMap);
    this.favorites = this.favRepos.getObject(this.tournament);
    this.againstRankingCalculator = new AgainstSportRoundRankingCalculator(this.competitionSport);
    this.sportRankingItems = this.againstRankingCalculator.getItemsForPoule(this.poule);
    console.log(this.sportRankingItems);
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
