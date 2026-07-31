import { ChangeDetectionStrategy, Component, Injector, OnInit, WritableSignal, inject, input, signal } from '@angular/core';
import { Poule, CompetitionSport, RoundRankingCalculator, RoundRankingItem, Cumulative, StructureNameService } from 'ngx-sport';

import { CSSService } from '../../../common/cssservice';
import { Favorites } from '../../../../lib/favorites';
import { FavoritesRepository } from '../../../../lib/favorites/repository';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PouleRankingModalComponent } from '../../poulerankingmodal/rankingmodal.component';
import { ViewPort, ViewPortManager, ViewPortNrOfColumnsMap } from '../../../common/viewPortManager';
import { TOURNAMENT_UI_IMPORTS } from '../../tournament.ui-imports';
import { EscapeHtmlPipe } from '../../../common/escapehtmlpipe';
import { POULE_RANKING_MODAL_INPUTS } from '../../../modal-input-interfaces/poule-ranking-modal-inputs.interface';
import { createModalInjector } from '../../../modal-input-interfaces/create-modal-injector';

@Component({
    selector: 'app-tournament-ranking-sports-table',
    templateUrl: './sports.component.html',
    styleUrls: ['./sports.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS, EscapeHtmlPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingSportsComponent implements OnInit {
  public poule = input.required<Poule>();
  public competitionSports = input<CompetitionSport[]>([]);
  public favorites = input<Favorites | undefined>(undefined);
  public structureNameService = input.required<StructureNameService>();
  public header = input.required<boolean>();

  protected roundRankingCalculator: RoundRankingCalculator;
  public roundRankingItems!: RoundRankingItem[];
  public viewPortManager!: ViewPortManager;
  gameRoundMap = new GameRoundMap();
  togetherRankingMap: TogetherRankingMap = new TogetherRankingMap();
  viewPointStart: number = 1;
  public showDifferenceDetail = false;
  public readonly processing: WritableSignal<boolean> = signal(true);
  private resolvedCompetitionSports: CompetitionSport[] = [];
  private modalService = inject(NgbModal);
  private injector = inject(Injector);

  constructor(
    public cssService: CSSService,
    public favRepos: FavoritesRepository) {
    this.roundRankingCalculator = new RoundRankingCalculator(undefined, Cumulative.byPerformance);
  }

  ngOnInit() {
    this.processing.set(true);
    this.roundRankingItems = this.roundRankingCalculator.getItemsForPoule(this.poule());
    const inputSports = this.competitionSports();
    this.resolvedCompetitionSports = inputSports.length > 0 ? inputSports : this.poule().getCompetition().getSports();
    this.viewPortManager = new ViewPortManager(this.getViewPortNrOfColumnsMap(), this.resolvedCompetitionSports.length);
    this.processing.set(false);
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
    const place = this.poule().getPlace(roundRankingItem.getUniqueRank());
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
    const modalInjector = createModalInjector(this.injector, POULE_RANKING_MODAL_INPUTS, {
      poule: this.poule(),
      competitionSports: [competitionSport],
      favorites: this.favorites()
    });
    this.modalService.open(PouleRankingModalComponent, { size: 'xl', injector: modalInjector });
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