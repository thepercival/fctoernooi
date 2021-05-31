import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, CompetitorMap, GameAmountConfig, Place, ScoreConfigService, TogetherGame, VoetbalRange, CompetitionSport, TogetherGamePlace, TogetherSportRoundRankingCalculator, SportRoundRankingItem, PlaceLocation } from 'ngx-sport';

import { CSSService } from '../../../common/cssservice';
import { Favorites } from '../../../../lib/favorites';
import { FavoritesRepository } from '../../../../lib/favorites/repository';
import { Tournament } from '../../../../lib/tournament';

@Component({
  selector: 'app-tournament-pouleranking-together-table',
  templateUrl: './together.component.html',
  styleUrls: ['./together.component.scss']
})
export class PouleRankingTogetherComponent implements OnInit {
  @Input() poule!: Poule;
  @Input() tournament!: Tournament;
  @Input() competitorMap!: CompetitorMap;
  @Input() competitionSport!: CompetitionSport;
  @Input() header!: boolean;
  protected togetherRankingCalculator!: TogetherSportRoundRankingCalculator;

  public sportRankingItems!: SportRoundRankingItem[];
  public nameService!: NameService;
  public favorites!: Favorites;
  gameAmountConfigs: GameAmountConfig[] = [];
  gameRoundMap = new GameRoundMap();
  togetherRankingMap: TogetherRankingMap = new TogetherRankingMap();
  nrOfGameRounds!: number;
  viewPortNrOfColumnsMap = new ViewPortNrOfColumnsMap();
  viewPortRangeMap!: ViewPortRangeMap;
  public processing = true;


  constructor(
    public cssService: CSSService,
    private scoreConfigService: ScoreConfigService,
    public favRepos: FavoritesRepository) {
  }

  ngOnInit() {
    this.processing = true;
    this.nameService = new NameService(this.competitorMap);
    this.favorites = this.favRepos.getObject(this.tournament);
    this.togetherRankingCalculator = new TogetherSportRoundRankingCalculator(this.competitionSport);
    this.sportRankingItems = this.togetherRankingCalculator.getItemsForPoule(this.poule);
    this.gameAmountConfigs = this.poule.getRound().getNumber().getValidGameAmountConfigs();
    this.initViewPortNrOfColumnsMap();
    this.initGameRoundMap();
    this.initTableData();
    this.processing = false;
  }

  protected initViewPortNrOfColumnsMap() {
    this.viewPortNrOfColumnsMap.set(ViewPort.xs, 2);
    this.viewPortNrOfColumnsMap.set(ViewPort.sm, 5);
    this.viewPortNrOfColumnsMap.set(ViewPort.md, 10);
    this.viewPortNrOfColumnsMap.set(ViewPort.lg, 15);
    this.viewPortNrOfColumnsMap.set(ViewPort.xl, 30);
  }

  /**
   * door door games en plaats elke gameplace ergens in een map
   * 
   * je wilt per deelnemer door de gamerounds lopen en dan per gameRound wil je score weten
   */
  initTableData() {
    this.gameAmountConfigs.forEach((gameAmountConfig: GameAmountConfig) => {
      this.poule.getPlaces().forEach((place: Place) => {
        const competitionSportMap = new CompetitionSportMap();
        competitionSportMap.set(gameAmountConfig.getCompetitionSport().getId(), new ScoreMap());
        this.togetherRankingMap.set(place.getNumber(), competitionSportMap);
      });
    });

    let activeGameRound = 0;

    this.poule.getTogetherGames().forEach((game: TogetherGame) => {
      const useSubScore = game.getScoreConfig()?.useSubScore();
      game.getTogetherPlaces().forEach((gamePlace: TogetherGamePlace) => {
        const compettionSportMap = this.togetherRankingMap.get(gamePlace.getPlace().getNumber());
        if (!compettionSportMap) {
          return;
        }
        const scoreMap = compettionSportMap.get(game.getCompetitionSport().getId());
        if (!scoreMap) {
          return;
        }
        const finalScore = this.scoreConfigService.getFinalTogetherScore(gamePlace, useSubScore);
        const gameRound = this.getGameRound(game.getCompetitionSport(), gamePlace.getGameRoundNumber());
        if (finalScore && gameRound > activeGameRound) {
          activeGameRound = gameRound;
        }
        scoreMap.set(gameRound, finalScore);
      });
    });
    this.updateActiveGameRound(activeGameRound);
  }

  updateActiveGameRound(gameRound: number) {
    const viewPortRangeMap = new ViewPortRangeMap();
    for (const [propertyKey, propertyValue] of Object.entries(ViewPort)) {
      if (!Number.isNaN(Number(propertyKey))) {
        continue;
      }
      const viewPort = <ViewPort>propertyValue;
      const nrOfColumns = this.viewPortNrOfColumnsMap.get(viewPort);
      if (nrOfColumns === undefined) {
        continue;
      }
      const range = gameRound === 0 ? { min: 1, max: nrOfColumns } : { min: gameRound - nrOfColumns + 1, max: gameRound };
      viewPortRangeMap.set(viewPort, range);
    }
    this.viewPortRangeMap = viewPortRangeMap;
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
    this.gameAmountConfigs.forEach(gameAmountConfig => {
      const gameRounds: number[] = [];
      const iterator = (new Array(gameAmountConfig.getAmount())).keys();
      for (const key of iterator) {
        gameRounds.push(startGameRound + key);
      }
      this.gameRoundMap.set(gameAmountConfig.getCompetitionSport().getId(), gameRounds);
      startGameRound += gameAmountConfig.getAmount();
    });
    this.nrOfGameRounds = startGameRound - 1;
  }

  getGameRounds(competitionSport: CompetitionSport): number[] {
    return this.gameRoundMap.get(competitionSport.getId()) ?? [];

  }

  getScore(placeLocation: PlaceLocation, gameAmountConfig: GameAmountConfig, gameRound: number): number {
    const compettionSportMap = this.togetherRankingMap.get(placeLocation.getPlaceNr());
    return compettionSportMap?.get(gameAmountConfig.getCompetitionSport().getId())?.get(gameRound) ?? 0;
  }

  getGameRound(competitionSport: CompetitionSport, gameRound: number): number {
    return this.getGameRounds(competitionSport)[0] + gameRound;;
  }

  getQualifyPlaceClass(rankingItem: SportRoundRankingItem): string {
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