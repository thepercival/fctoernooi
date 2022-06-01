import { Component, Input, OnInit } from '@angular/core';
import { Poule, CompetitionSport, AgainstH2h, AgainstGpp, Single, AllInOneGame, StructureNameService } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../../lib/favorites';

@Component({
  selector: 'app-tournament-pouleranking',
  templateUrl: './poule.component.html',
  styleUrls: ['./poule.component.scss']
})
export class RankingPouleComponent implements OnInit {
  @Input() poule!: Poule;
  @Input() favorites: Favorites | undefined;
  @Input() competitionSports: CompetitionSport[] = [];
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

  get singleAgainstCompetitionSport(): CompetitionSport | undefined {
    const singleCompetitionSport = this.getSingleCompetitionSport();
    if (singleCompetitionSport === undefined || !this.isAgainst(singleCompetitionSport)) {
      return undefined;
    }
    return singleCompetitionSport;
  }

  get singleTogetherCompetitionSport(): CompetitionSport | undefined {
    const singleCompetitionSport = this.getSingleCompetitionSport();
    if (singleCompetitionSport === undefined || !this.isTogether(singleCompetitionSport)) {
      return undefined;
    }
    return singleCompetitionSport;
  }

  getSingleCompetitionSport(): CompetitionSport | undefined {
    return this.competitionSports.length === 1 ? this.competitionSports[0] : undefined;
  }

  isAgainst(competitionSport: CompetitionSport): boolean {
    return (competitionSport.getVariant() instanceof AgainstH2h) || (competitionSport.getVariant() instanceof AgainstGpp);
  }

  isTogether(competitionSport: CompetitionSport): boolean {
    return (competitionSport?.getVariant() instanceof Single) || (competitionSport.getVariant() instanceof AllInOneGame);
  }
}
