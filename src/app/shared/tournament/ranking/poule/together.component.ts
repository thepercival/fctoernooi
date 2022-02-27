import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, CompetitorMap, GameAmountConfig, ScoreConfigService, TogetherGame, CompetitionSport, TogetherGamePlace, TogetherSportRoundRankingCalculator, SportRoundRankingItem, PlaceLocation, GameState, Single, AllInOneGame, Place, AgainstH2h, AgainstGpp } from 'ngx-sport';

import { CSSService } from '../../../common/cssservice';
import { Favorites } from '../../../../lib/favorites';
import { FavoritesRepository } from '../../../../lib/favorites/repository';
import { Tournament } from '../../../../lib/tournament';
import { ViewPort, ViewPortManager, ViewPortNrOfColumnsMap } from '../../../common/viewPortManager';

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
  public viewPortManager!: ViewPortManager;
  protected gameAmountConfig!: GameAmountConfig;
  protected scoreMap = new ScoreMap();
  nrOfGameRounds!: number;
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
    this.gameAmountConfig = this.poule.getRound().getNumber().getValidGameAmountConfig(this.competitionSport);
    //this.initGameRoundMap();    
    this.viewPortManager = new ViewPortManager(this.getViewPortNrOfColumnsMap(), this.getGameRounds().length);
    this.initTableData();
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

  /**
   * door door games en plaats elke gameplace ergens in een map
   * 
   * je wilt per deelnemer door de gamerounds lopen en dan per gameRound wil je score weten
   */
  initTableData() {

    this.poule.getPlaces().forEach((place: Place) => {
      this.scoreMap.set(place.getRoundLocationId(), {});
    });

    let gameRoundWithFinishedGame = 1;

    this.getTogetherGames().forEach((game: TogetherGame) => {
      const useSubScore = game.getScoreConfig()?.useSubScore();
      const finished = game.getState() === GameState.Finished;
      game.getTogetherPlaces().forEach((gamePlace: TogetherGamePlace) => {
        const gameRoundMap = this.scoreMap.get(gamePlace.getPlace().getRoundLocationId());
        if (gameRoundMap === undefined) {
          return;
        }
        const finalScore = this.scoreConfigService.getFinalTogetherScore(gamePlace, useSubScore);
        const gameRoundNr = gamePlace.getGameRoundNumber();
        if (finished && gameRoundNr > gameRoundWithFinishedGame) {
          gameRoundWithFinishedGame = gameRoundNr;
        }
        gameRoundMap[gameRoundNr] = finalScore;
      });
    });
    this.viewPortManager.initViewPorts(gameRoundWithFinishedGame);
  }

  protected getTogetherGames(): TogetherGame[] {
    return this.poule.getTogetherGames().filter((game: TogetherGame) => game.getCompetitionSport() === this.competitionSport);
  }

  protected getSportVariant(): Single | AllInOneGame {
    const sportVariant = this.competitionSport.getVariant();
    if (sportVariant instanceof AgainstH2h || sportVariant instanceof AgainstGpp) {
      throw new Error('incorrect sportvariant');
    }
    return sportVariant;
  }

  getGameRounds(): number[] {
    const gameRounds: number[] = [];
    const iterator = (new Array(this.gameAmountConfig.getAmount())).keys();
    for (const key of iterator) {
      gameRounds.push(1 + key);
    }
    return gameRounds;
  }

  getScore(placeLocation: PlaceLocation, gameRound: number): number {
    const gameRoundMap = this.scoreMap.get(placeLocation.getRoundLocationId());
    if (gameRoundMap === undefined) {
      return 0;
    }
    return gameRoundMap[gameRound];
  }

  // getGameRound(competitionSport: CompetitionSport, gameRound: number): number {
  //   return this.getGameRounds(competitionSport)[0] + gameRound;;
  // }

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


interface GameRoundMap {
  [key: number]: number;
}
class ScoreMap extends Map<string, GameRoundMap> {

}