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
    public category = input.required<Category>();
    public favorites = input<Favorites | undefined>(undefined);
    public competitionSports = input.required<CompetitionSport[]>();
    public showHeader = input.required<boolean>();
    public structureNameService = input.required<StructureNameService>();

    public activeTabName!: string;
    public multipleRounds: boolean = false;
    
    

    constructor(
        protected tournamentMapper: TournamentMapper,
        protected authService: AuthService
    ) {

    }

    ngOnInit() {
        this.multipleRounds = this.category().getRootRound().getChildren().length > 0;
        this.initTabNr();
    }

    initTabNr(): void {

        let activeTabNr = 1;
        if (this.multipleRounds 
            && this.category().getRootRound().getStructureCell().getLast().getGamesState() === GameState.Finished) {
            activeTabNr = 2;
        }
        this.activeTabName = this.getTabName(activeTabNr);
    }

    get RankingScreen(): TournamentScreen { return TournamentScreen.Ranking }

    getTabName(tabNr: number): string {
        return this.category().getNumber() + '-' + tabNr;
    }
}
