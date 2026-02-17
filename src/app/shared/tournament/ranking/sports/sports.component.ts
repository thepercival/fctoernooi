import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { Poule, CompetitionSport, RoundRankingCalculator, RoundRankingItem, Cumulative, StructureNameService } from 'ngx-sport';

import { CSSService } from '../../../common/cssservice';
import { Favorites } from '../../../../lib/favorites';
import { FavoritesRepository } from '../../../../lib/favorites/repository';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PouleRankingModalComponent } from '../../poulerankingmodal/rankingmodal.component';
import { ViewPort, ViewPortManager, ViewPortNrOfColumnsMap } from '../../../common/viewPortManager';
import { TOURNAMENT_UI_IMPORTS } from '../../tournament.ui-imports';

@Component({
    selector: 'app-tournament-ranking-sports-table',
    templateUrl: './sports.component.html',
    styleUrls: ['./sports.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingSportsComponent implements OnInit {
  readonly _poule = input.required<Poule>();
  readonly _competitionSports = input<CompetitionSport[]>([]);
  readonly _favorites = input<Favorites | undefined>(undefined);
  readonly _structureNameService = input.required<StructureNameService>();
  readonly _header = input.required<boolean>();
  protected roundRankingCalculator: RoundRankingCalculator;
  public roundRankingItems!: RoundRankingItem[];
  public viewPortManager!: ViewPortManager;
  gameRoundMap = new GameRoundMap();
  togetherRankingMap: TogetherRankingMap = new TogetherRankingMap();
  viewPointStart: number = 1;
  public showDifferenceDetail = false;
  public processing = true;
  private resolvedCompetitionSports: CompetitionSport[] = [];
  private modalService = inject(NgbModal);

  constructor(
    public cssService: CSSService,
    public favRepos: FavoritesRepository) {
    this.roundRankingCalculator = new RoundRankingCalculator(undefined, Cumulative.byPerformance);
  }

  ngOnInit() {
    this.processing = true;
    this.roundRankingItems = this.roundRankingCalculator.getItemsForPoule(this.poule);
    const inputSports = this._competitionSports();
    this.resolvedCompetitionSports = inputSports.length > 0 ? inputSports : this.poule.getCompetition().getSports();
    this.viewPortManager = new ViewPortManager(this.getViewPortNrOfColumnsMap(), this.competitionSports.length);
    this.processing = false;
  }

  protected getViewPortNrOfColumnsMap(): ViewPortNrOfColumnsMap {
    const viewPortNrOfColumnsMap = new ViewPortNrOfColumnsMap();
    viewPortNrOfColumnsMap.set(ViewPort.xs, 2);
    viewPortNrOfColumnsMap.set(ViewPort.sm, 5);
    viewPortNrOfColumnsMap.set(ViewPort.md, 10);
    viewPortNrOfColumnsMap.set(ViewPort.lg, 15);
    viewPortNrOfColumnsMap.set(ViewPort.xl, 30);
    return viewPortNrOfColumnsMap;
  }

  getQualifyPlaceClass(roundRankingItem: RoundRankingItem): string {
    const place = this.poule.getPlace(roundRankingItem.getUniqueRank());
    return place ? this.cssService.getQualifyPlace(place) : '';
  }

  // getViewRange(viewport: number): VoetbalRange {
  //   return { min: this.activeGameRound - (viewport - 1), max: this.activeGameRound };
  // }

  // nrOfColumnsPerViewport: ViewPortColumns = { xs: 2, sm: 5, md: 10, lg: 15, xl: 30 };

  // useSubScore() {
  //   return this.poule.getRound().getNumber().getValidScoreConfigs().some(scoreConfig => {
  //     return scoreConfig.useSubScore();
  //   });
  // }

  openModalPouleRank(competitionSport: CompetitionSport) {
    const modalRef = this.modalService.open(PouleRankingModalComponent, { size: 'xl' });
    modalRef.componentInstance.poule = this.poule;
    modalRef.componentInstance.competitionSports = [competitionSport];
    modalRef.componentInstance.favorites = this.favorites;
  }

  get poule(): Poule {
    return this._poule();
  }

  get competitionSports(): CompetitionSport[] {
    return this.resolvedCompetitionSports;
  }

  get favorites(): Favorites | undefined {
    return this._favorites();
  }

  get structureNameService(): StructureNameService {
    return this._structureNameService();
  }

  get header(): boolean {
    return this._header();
  }
}

class TogetherRankingMap extends Map<number, CompetitionSportMap>{
}

class CompetitionSportMap extends Map<number | string, ScoreMap>{
}

class ScoreMap extends Map<number, number> {

}

class StartGameRoundMap extends Map<number | string, number> {

}

class GameRoundMap extends Map<number | string, number[]> {

}