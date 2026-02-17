import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';

import { Category, CompetitionSport, GameState, StructureNameService } from 'ngx-sport';
import { AuthService } from '../../../lib/auth/auth.service';
import { Favorites } from '../../../lib/favorites';
import { TournamentMapper } from '../../../lib/tournament/mapper';
import { TournamentScreen } from '../screenNames';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';
import { RankingRoundComponent } from './round.component';
import { RankingEndComponent } from './end.component';

@Component({
    selector: 'app-tournament-ranking-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss'],
    imports: [TOURNAMENT_UI_IMPORTS, RankingEndComponent, RankingRoundComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingCategoryComponent implements OnInit {
    readonly _category = input.required<Category>();
    readonly _favorites = input<Favorites | undefined>(undefined);
    readonly _competitionSports = input.required<CompetitionSport[]>();
    readonly _showHeader = input.required<boolean>();
    readonly _structureNameService = input.required<StructureNameService>();

    public activeTabName!: string;
    public multipleRounds: boolean = false;
    
    

    constructor(
        protected tournamentMapper: TournamentMapper,
        protected authService: AuthService
    ) {

    }

    ngOnInit() {
        this.multipleRounds = this.category.getRootRound().getChildren().length > 0;
        this.initTabNr();
    }

    initTabNr(): void {

        let activeTabNr = 1;
        if (this.multipleRounds 
            && this.category.getRootRound().getStructureCell().getLast().getGamesState() === GameState.Finished) {
            activeTabNr = 2;
        }
        this.activeTabName = this.getTabName(activeTabNr);
    }

    get RankingScreen(): TournamentScreen { return TournamentScreen.Ranking }

    getTabName(tabNr: number): string {
        return this.category.getNumber() + '-' + tabNr;
    }

    get category(): Category {
        return this._category();
    }

    get favorites(): Favorites | undefined {
        return this._favorites();
    }

    get competitionSports(): CompetitionSport[] {
        return this._competitionSports();
    }

    get showHeader(): boolean {
        return this._showHeader();
    }

    get structureNameService(): StructureNameService {
        return this._structureNameService();
    }
}
