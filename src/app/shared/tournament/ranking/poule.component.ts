import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { Poule, CompetitionSport, AgainstH2h, AgainstGpp, Single, AllInOneGame, StructureNameService } from 'ngx-sport';
import { CommonModule } from "module";

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
    imports: [NgIf, TOURNAMENT_UI_IMPORTS, RankingSportsComponent, RankingAgainstComponent, RankingTogetherComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingPouleComponent implements OnInit {
  readonly _poule = input.required<Poule>();
  readonly _favorites = input<Favorites | undefined>(undefined);
  readonly _competitionSports = input<CompetitionSport[]>([]);
  readonly _structureNameService = input.required<StructureNameService>();
  readonly _header = input.required<boolean>();

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

  get poule(): Poule {
    return this._poule();
  }

  get favorites(): Favorites | undefined {
    return this._favorites();
  }

  get competitionSports(): CompetitionSport[] {
    return this._competitionSports();
  }

  get structureNameService(): StructureNameService {
    return this._structureNameService();
  }

  get header(): boolean {
    return this._header();
  }
}
