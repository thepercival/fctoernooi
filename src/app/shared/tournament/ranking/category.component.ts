import { Component, Input, OnInit } from '@angular/core';

import { AgainstRuleSet, Category, CompetitionSport, StructureNameService } from 'ngx-sport';
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

    public activeTabNr!: string;

    constructor(
        protected tournamentMapper: TournamentMapper,
        protected authService: AuthService
    ) {

    }

    ngOnInit() {
        this.activeTabNr = this.getTabName(1);
    }

    get RankingScreen(): TournamentScreen { return TournamentScreen.Ranking }

    getTabName(tabNr: number): string {
        return this.category.getNumber() + '-' + tabNr;
    }
}
