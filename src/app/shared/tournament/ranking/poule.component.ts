import { ChangeDetectionStrategy, Component, OnInit, input, model } from '@angular/core';
import { Poule, CompetitionSport, AgainstH2h, AgainstGpp, Single, AllInOneGame, StructureNameService } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';
import { Favorites } from '../../../lib/favorites';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';
import { RankingSportsComponent } from './sports/sports.component';
import { RankingAgainstComponent } from './sports/against.component';
import { RankingTogetherComponent } from './sports/together.component';

@Component({
    selector: 'app-tournament-pouleranking',
    templateUrl: './poule.component.html',
    styleUrls: ['./poule.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS, RankingAgainstComponent, RankingSportsComponent, RankingAgainstComponent, RankingTogetherComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingPouleComponent implements OnInit {
  public poule = input.required<Poule>();
  public favorites = input<Favorites | undefined>(undefined);
  public competitionSports = input<CompetitionSport[]>([]);
  public structureNameService = input.required<StructureNameService>();
  public header = input.required<boolean>();

  public processing = model(true);

  constructor(
    public cssService: CSSService
  ) {
  }

  ngOnInit() {
    this.processing.set(false);
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
    return this.competitionSports.length === 1 ? this.competitionSports()[0] : undefined;
  }

  isAgainst(competitionSport: CompetitionSport): boolean {
    return (competitionSport.getVariant() instanceof AgainstH2h) || (competitionSport.getVariant() instanceof AgainstGpp);
  }

  isTogether(competitionSport: CompetitionSport): boolean {
    return (competitionSport?.getVariant() instanceof Single) || (competitionSport.getVariant() instanceof AllInOneGame);
  }
}
