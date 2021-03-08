import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, CompetitorMap, GameMode } from 'ngx-sport';

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
  @Input() competitorMap!: CompetitorMap;
  @Input() header!: boolean;

  public nameService!: NameService;
  public processing = true;

  constructor(
    public cssService: CSSService
  ) {
  }

  ngOnInit() {
    this.processing = true;
    this.nameService = new NameService(this.competitorMap);
    this.processing = false;
  }

  get Sports(): RoundRanking { return RoundRanking.Sports; }
  get Against(): RoundRanking { return RoundRanking.Against; }
  get Together(): RoundRanking { return RoundRanking.Together; }

  get RoundRanking(): RoundRanking {
    const competitionSports = this.poule.getRound().getCompetition().getSports();
    if (competitionSports.length > 1) {
      return RoundRanking.Sports;
    } else if (competitionSports[0].getSport().getGameMode() === GameMode.Against) {
      return RoundRanking.Against;
    }
    return RoundRanking.Together;
  }
}

enum RoundRanking { Sports = 1, Against, Together };
