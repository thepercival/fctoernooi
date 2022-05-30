import { Component, Input, OnInit } from '@angular/core';
import { Poule, CompetitionSport, RoundRankingCalculator, RoundRankingItem, Cumulative, StructureNameService, Place } from 'ngx-sport';

import { CSSService } from '../../../common/cssservice';
import { Favorites } from '../../../../lib/favorites';
import { FavoritesRepository } from '../../../../lib/favorites/repository';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PouleRankingModalComponent } from '../../poulerankingmodal/rankingmodal.component';
import { Tournament } from '../../../../lib/tournament';
import { ViewPort, ViewPortManager, ViewPortNrOfColumnsMap } from '../../../common/viewPortManager';

@Component({
  selector: 'app-tournament-pouleranking-sports-table',
  templateUrl: './sports.component.html',
  styleUrls: ['./sports.component.scss']
})
export class PouleRankingSportsComponent implements OnInit {
  @Input() poule!: Poule;
  @Input() tournament!: Tournament;
  @Input() structureNameService!: StructureNameService;
  @Input() header!: boolean;
  protected roundRankingCalculator: RoundRankingCalculator;
  public roundRankingItems!: RoundRankingItem[];
  public favorites!: Favorites;
  public viewPortManager!: ViewPortManager;
  competitionSports: CompetitionSport[] = [];
  gameRoundMap = new GameRoundMap();
  togetherRankingMap: TogetherRankingMap = new TogetherRankingMap();
  viewPointStart: number = 1;
  public showDifferenceDetail = false;
  public processing = true;


  constructor(
    public cssService: CSSService,
    private modalService: NgbModal,
    public favRepos: FavoritesRepository) {
    this.roundRankingCalculator = new RoundRankingCalculator(undefined, Cumulative.byPerformance);
  }

  ngOnInit() {
    this.processing = true;
    this.favorites = this.favRepos.getObject(this.tournament, undefined);
    this.roundRankingItems = this.roundRankingCalculator.getItemsForPoule(this.poule);
    this.competitionSports = this.poule.getCompetition().getSports();
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
    modalRef.componentInstance.competitionSport = competitionSport;
    modalRef.componentInstance.tournament = this.tournament;
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