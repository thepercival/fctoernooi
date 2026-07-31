import { ChangeDetectionStrategy, Component, OnInit, WritableSignal, input, signal, inject } from '@angular/core';
import { Poule, ScoreConfig, AgainstSportRoundRankingCalculator, CompetitionSport, SportRoundRankingItem, StructureNameService, Competitor, StartLocation, Place } from 'ngx-sport';
import { Favorites } from '../../../../lib/favorites';
import { FavoritesRepository } from '../../../../lib/favorites/repository';
import { CSSService } from '../../../common/cssservice';
import { TournamentCompetitor } from '../../../../lib/competitor';
import { CompetitorRepository } from '../../../../lib/ngx-sport/competitor/repository';
import { TOURNAMENT_UI_IMPORTS } from '../../tournament.ui-imports';
import { EscapeHtmlPipe } from '../../../common/escapehtmlpipe';


@Component({
    selector: 'app-tournament-ranking-against-table',
    templateUrl: './against.component.html',
    styleUrls: ['./against.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS, EscapeHtmlPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingAgainstComponent implements OnInit {
  cssService = inject(CSSService);
  favRepos = inject(FavoritesRepository);
  private competitorRepository = inject(CompetitorRepository);

  public poule = input.required<Poule>();
  public competitionSport = input.required<CompetitionSport>();
  public favorites = input<Favorites | undefined>(undefined);
  public structureNameService = input.required<StructureNameService>();
  public header = input.required<boolean>();
  protected againstRankingCalculator!: AgainstSportRoundRankingCalculator;
  public sportRankingItems!: SportRoundRankingItem[];
  public showDifferenceDetail = false;
  public readonly processing: WritableSignal<boolean> = signal(true);
  constructor() {
  }

  ngOnInit() {
    this.processing.set(true);
    this.againstRankingCalculator = new AgainstSportRoundRankingCalculator(this.competitionSport());
    this.sportRankingItems = this.againstRankingCalculator.getItemsForPoule(this.poule());
    // console.log(this.sportRankingItems);
    this.processing.set(false);
  }

  useSubScore() {
    return this.poule().getRound().getValidScoreConfigs().some((scoreConfig: ScoreConfig) => {
      return scoreConfig.useSubScore();
    });
  }

  getQualifyPlaceClass(rankingItem: SportRoundRankingItem): string {
    const place = this.poule().getPlace(rankingItem.getUniqueRank());
    return place ? this.cssService.getQualifyPlace(place) : '';
  }

  getCompetitor(startLocation: StartLocation | undefined): Competitor | undefined {
    if (startLocation === undefined) {
      return undefined;
    }
    return this.structureNameService().getStartLocationMap()?.getCompetitor(startLocation);
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
