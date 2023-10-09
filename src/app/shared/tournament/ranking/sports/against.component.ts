import { Component, Input, OnInit } from '@angular/core';
import { Poule, ScoreConfig, AgainstSportRoundRankingCalculator, CompetitionSport, SportRoundRankingItem, StructureNameService, Competitor, StartLocation, Place } from 'ngx-sport';
import { Favorites } from '../../../../lib/favorites';
import { FavoritesRepository } from '../../../../lib/favorites/repository';
import { CSSService } from '../../../common/cssservice';
import { TournamentCompetitor } from '../../../../lib/competitor';
import { CompetitorRepository } from '../../../../lib/ngx-sport/competitor/repository';


@Component({
  selector: 'app-tournament-ranking-against-table',
  templateUrl: './against.component.html',
  styleUrls: ['./against.component.scss']
})
export class RankingAgainstComponent implements OnInit {
  @Input() poule!: Poule;
  @Input() competitionSport!: CompetitionSport;
  @Input() favorites: Favorites | undefined;
  @Input() structureNameService!: StructureNameService;
  @Input() header!: boolean;
  protected againstRankingCalculator!: AgainstSportRoundRankingCalculator;
  public sportRankingItems!: SportRoundRankingItem[];
  public showDifferenceDetail = false;
  public processing = true;

  constructor(
    public cssService: CSSService,
    public favRepos: FavoritesRepository,
    private competitorRepository: CompetitorRepository) {
  }

  ngOnInit() {
    this.processing = true;
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

  getCompetitor(startLocation: StartLocation | undefined): Competitor | undefined {
    if (startLocation === undefined) {
      return undefined;
    }
    return this.structureNameService.getStartLocationMap()?.getCompetitor(startLocation);
  }

  public hasLogo(place: Place): boolean {
    const competitor = this.getCompetitor(place.getStartLocation());
    return competitor ? this.competitorRepository.hasLogoExtension(<TournamentCompetitor>competitor) : false;
  }

  public getCompetitorLogoUrl(place: Place): string {
    const competitor = this.getCompetitor(place.getStartLocation());
    return competitor ? this.competitorRepository.getLogoUrl(<TournamentCompetitor>competitor, 20) : '';
  }
}
