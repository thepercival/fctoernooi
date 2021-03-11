import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, CompetitorMap, VoetbalRange, CompetitionSport, RoundRankingCalculator, RankedRoundItem } from 'ngx-sport';

import { CSSService } from '../../../common/cssservice';
import { Favorites } from '../../../../lib/favorites';
import { FavoritesRepository } from '../../../../lib/favorites/repository';

@Component({
  selector: 'app-tournament-pouleranking-sports-table',
  templateUrl: './sports.component.html',
  styleUrls: ['./sports.component.scss']
})
export class PouleRankingSportsComponent implements OnInit {
  @Input() poule!: Poule;
  @Input() favorites!: Favorites;
  @Input() competitorMap!: CompetitorMap;
  @Input() header!: boolean;
  protected roundRankingCalculator: RoundRankingCalculator;
  public rankedRoundItems!: RankedRoundItem[];
  public nameService!: NameService;
  competitionSports: CompetitionSport[] = [];
  gameRoundMap = new GameRoundMap();
  togetherRankingMap: TogetherRankingMap = new TogetherRankingMap();
  nrOfGameRounds!: number;
  viewPortNrOfColumnsMap = new ViewPortNrOfColumnsMap();
  viewPortRangeMap!: ViewPortRangeMap;
  public processing = true;


  constructor(
    public cssService: CSSService,
    public favRepository: FavoritesRepository) {
    this.roundRankingCalculator = new RoundRankingCalculator();
  }

  ngOnInit() {
    this.processing = true;
    this.nameService = new NameService(this.competitorMap);
    this.rankedRoundItems = this.roundRankingCalculator.getItemsForPoule(this.poule);
    this.competitionSports = this.poule.getCompetition().getSports();
    this.initViewPortNrOfColumnsMap();
    this.initGameRoundMap();
    this.processing = false;
  }

  protected initViewPortNrOfColumnsMap() {
    this.viewPortNrOfColumnsMap.set(ViewPort.xs, 2);
    this.viewPortNrOfColumnsMap.set(ViewPort.sm, 5);
    this.viewPortNrOfColumnsMap.set(ViewPort.md, 10);
    this.viewPortNrOfColumnsMap.set(ViewPort.lg, 15);
    this.viewPortNrOfColumnsMap.set(ViewPort.xl, 30);
  }

  getViewPortClass(gameRound: number): string {
    for (const [propertyKey, propertyValue] of Object.entries(ViewPort)) {
      if (!Number.isNaN(Number(propertyKey))) {
        continue;
      }
      const viewPort = <ViewPort>propertyValue;
      const viewPortRange = this.viewPortRangeMap.get(viewPort);
      if (!viewPortRange || gameRound < viewPortRange.min || gameRound > viewPortRange.max) {
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

    // check in which viewPort the gameRound number is active, than return that class
    // this.viewPortRangeMap
    // HIER JUISTE CLASSES TOEVOEGEN
    // BEVRAAG
    return '';
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

  getQualifyPlaceClass(rankingItem: RankedRoundItem): string {
    const place = this.poule.getPlace(rankingItem.getUniqueRank());
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


class ViewPortNrOfColumnsMap extends Map<ViewPort, number> {

}
class ViewPortRangeMap extends Map<ViewPort, VoetbalRange> {

}

enum ViewPort { xs, sm, md, lg, xl }