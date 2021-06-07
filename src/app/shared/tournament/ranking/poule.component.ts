import { Component, Input, OnInit } from '@angular/core';
import { NameService, Poule, CompetitorMap, AgainstSportVariant, CompetitionSport, SingleSportVariant, AllInOneGameSportVariant } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';
import { Tournament } from '../../../lib/tournament';

@Component({
  selector: 'app-tournament-pouleranking',
  templateUrl: './poule.component.html',
  styleUrls: ['./poule.component.scss']
})
export class PouleRankingComponent implements OnInit {
  @Input() poule!: Poule;
  @Input() tournament!: Tournament;
  @Input() competitionSport: CompetitionSport | undefined;
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

  isAgainst(): boolean {
    return (this.competitionSport?.getVariant() instanceof AgainstSportVariant);
  }

  isTogether(): boolean {
    return (this.competitionSport?.getVariant() instanceof SingleSportVariant)
      || (this.competitionSport?.getVariant() instanceof AllInOneGameSportVariant);
  }
}
