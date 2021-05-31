import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, CompetitorMap, VoetbalRange, CompetitionSport, RoundRankingCalculator, RoundRankingItem } from 'ngx-sport';

import { CSSService } from '../../../common/cssservice';
import { Favorites } from '../../../../lib/favorites';
import { FavoritesRepository } from '../../../../lib/favorites/repository';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PouleRankingModalComponent } from '../../poulerankingmodal/rankingmodal.component';
import { Tournament } from '../../../../lib/tournament';

@Component({
  selector: 'app-tournament-pouleranking-sports-table',
  templateUrl: './sports.component.html',
  styleUrls: ['./sports.component.scss']
})
export class PouleRankingSportsComponent implements OnInit {
  @Input() poule!: Poule;
  @Input() tournament!: Tournament;
  @Input() competitorMap!: CompetitorMap;
  @Input() header!: boolean;
  protected roundRankingCalculator: RoundRankingCalculator;
  public roundRankingItems!: RoundRankingItem[];
  public nameService!: NameService;
  public favorites!: Favorites;
  competitionSports: CompetitionSport[] = [];
  gameRoundMap = new GameRoundMap();
  togetherRankingMap: TogetherRankingMap = new TogetherRankingMap();
  nrOfGameRounds!: number;
  viewPointStart: number = 1;
  public processing = true;


  constructor(
    public cssService: CSSService,
    private modalService: NgbModal,
    public favRepos: FavoritesRepository) {
    this.roundRankingCalculator = new RoundRankingCalculator();
  }

  ngOnInit() {
    this.processing = true;
    this.nameService = new NameService(this.competitorMap);
    this.favorites = this.favRepos.getObject(this.tournament);
    this.roundRankingItems = this.roundRankingCalculator.getItemsForPoule(this.poule);
    this.competitionSports = this.poule.getCompetition().getSports();
    this.initGameRoundMap();
    this.processing = false;
  }

  protected getNrOfColumns(viewPort: ViewPort): number {
    switch (viewPort) {
      case ViewPort.xs:
        return 2;
      case ViewPort.sm:
        return 5;
      case ViewPort.md:
        return 10;
      case ViewPort.lg:
        return 15;
      default: // xl
        return 30;
    }
  }

  getViewPortClass(gameRound: number): string {
    for (const [propertyKey, propertyValue] of Object.entries(ViewPort)) {
      if (!Number.isNaN(Number(propertyKey))) {
        continue;
      }
      const viewPort = <ViewPort>propertyValue;
      const nrOfColumns = this.getNrOfColumns(viewPort);
      const viewPortEnd = this.viewPointStart + (nrOfColumns - 1)
      if (!viewPortEnd || gameRound < this.viewPointStart || gameRound > viewPortEnd) {
        continue;
      }
      if (viewPort === ViewPort.xs) {
        return '';
      }
      return 'd-none d-' + propertyKey + '-table-cell';
    }
    return 'd-none';
    // als in xs dan niets
    // als in sm dan .d-none .d-sm-block
    // als in md dan .d-none .d-sm-block
  }

  initGameRoundMap() {
    let startGameRound = 1;
    // this.gameAmountConfigs.forEach(gameAmountConfig => {
    //   const gameRounds: number[] = [];
    //   const iterator = (new Array(gameAmountConfig.getAmount())).keys();
    //   for (const key of iterator) {
    //     gameRounds.push(startGameRound + key);
    //   }
    //   this.gameRoundMap.set(gameAmountConfig.getCompetitionSport().getId(), gameRounds);
    //   startGameRound += gameAmountConfig.getAmount();
    // });
    this.nrOfGameRounds = startGameRound - 1;
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

class ViewPortRangeMap extends Map<ViewPort, VoetbalRange> {

}

enum ViewPort { xs, sm, md, lg, xl }