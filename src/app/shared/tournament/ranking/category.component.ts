import { Component, Input, OnInit } from '@angular/core';

import { Category, CompetitionSport, GameState, StructureNameService } from 'ngx-sport';
import { AuthService } from '../../../lib/auth/auth.service';
import { Favorites } from '../../../lib/favorites';
import { TournamentMapper } from '../../../lib/tournament/mapper';
import { TournamentScreen } from '../screenNames';

@Component({
    selector: 'app-tournament-ranking-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class RankingCategoryComponent implements OnInit {
    @Input() category!: Category;
    @Input() favorites: Favorites | undefined;
    @Input() competitionSports!: CompetitionSport[];
    @Input() showHeader!: boolean;
    @Input() structureNameService!: StructureNameService;

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
}
