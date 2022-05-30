import { Component, Input, OnInit } from '@angular/core';
import { Poule, ScoreConfig, AgainstSportRoundRankingCalculator, CompetitionSport, SportRoundRankingItem, StructureNameService } from 'ngx-sport';
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
  @Input() structureNameService!: StructureNameService;
  @Input() header!: boolean;
  public favorites!: Favorites;
  protected againstRankingCalculator!: AgainstSportRoundRankingCalculator;
  public sportRankingItems!: SportRoundRankingItem[];
  public showDifferenceDetail = false;
  public processing = true;

  constructor(
    public cssService: CSSService,
    public favRepos: FavoritesRepository) {
  }

  ngOnInit() {
    this.processing = true;
    this.favorites = this.favRepos.getObject(this.tournament, undefined);
    this.againstRankingCalculator = new AgainstSportRoundRankingCalculator(this.competitionSport);
    this.sportRankingItems = this.againstRankingCalculator.getItemsForPoule(this.poule);
    // console.log(this.sportRankingItems);
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
