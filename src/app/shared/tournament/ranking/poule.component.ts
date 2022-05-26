import { Component, Input, OnInit } from '@angular/core';
import { Poule, CompetitionSport, AgainstH2h, AgainstGpp, Single, AllInOneGame, StructureNameService } from 'ngx-sport';

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
  @Input() structureNameService!: StructureNameService;
  @Input() header!: boolean;

  public processing = true;

  constructor(
    public cssService: CSSService
  ) {
  }

  ngOnInit() {
    this.processing = true;
    this.processing = false;
  }

  isAgainst(): boolean {
    return (this.competitionSport?.getVariant() instanceof AgainstH2h)
      || (this.competitionSport?.getVariant() instanceof AgainstGpp);
  }

  isTogether(): boolean {
    return (this.competitionSport?.getVariant() instanceof Single)
      || (this.competitionSport?.getVariant() instanceof AllInOneGame);
  }
}
