import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, RankedRoundItem, RankingService, PlaceLocationMap, GameMode, ScoreConfig } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../../lib/favorites';

@Component({
  selector: 'app-tournament-pouleranking',
  templateUrl: './poule.component.html',
  styleUrls: ['./poule.component.scss']
})
export class PouleRankingComponent implements OnInit {
  @Input() poule!: Poule;
  @Input() favorites!: Favorites;
  @Input() placeLocationMap!: PlaceLocationMap;
  @Input() header!: boolean;
  public rankingService!: RankingService;
  public gameMode!: GameMode;

  public nameService!: NameService;
  public processing = true;

  constructor(
    public cssService: CSSService
  ) {
  }

  ngOnInit() {
    this.processing = true;
    this.nameService = new NameService(this.placeLocationMap);
    this.gameMode = this.poule.getRound().getNumber().getValidPlanningConfig().getGameMode();
    this.rankingService = new RankingService(
      this.gameMode, this.poule.getRound().getNumber().getCompetition().getRankingRuleSet()
    );
    this.processing = false;
  }

  get Against(): GameMode { return GameMode.Against; }
  get Together(): GameMode { return GameMode.Together; }
}
