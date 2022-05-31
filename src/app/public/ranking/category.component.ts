import { Component, Input, OnInit } from '@angular/core';

import { AgainstRuleSet, Category, CompetitionSport, StructureNameService } from 'ngx-sport';
import { AuthService } from '../../lib/auth/auth.service';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { Favorites } from '../../lib/favorites';
import { TournamentScreen } from '../../shared/tournament/screenNames';

@Component({
    selector: 'app-tournament-ranking-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class RankingCategoryComponent implements OnInit {
    @Input() category!: Category;
    @Input() favorites!: Favorites;
    @Input() competitionSports!: CompetitionSport[];
    // @Input() filterActive: boolean = false;
    @Input() showHeader!: boolean;
    // @Input() favoriteCompetitors: Competitor[] = [];
    @Input() structureNameService!: StructureNameService;

    public activeTabNr: string = '1';
    public againstRuleSet!: AgainstRuleSet;
    public hasBegun: boolean = true;

    constructor(
        protected tournamentMapper: TournamentMapper,
        protected authService: AuthService
    ) {

    }

    ngOnInit() {
        console.log('cdk');
        this.activeTabNr = this.getTabName(1);
    }

    get RankingScreen(): TournamentScreen { return TournamentScreen.Ranking }

    getTabName(tabNr: number): string {
        return this.category.getNumber() + '-' + tabNr;

    }


    // isAdmin(): boolean {
    //     return this.hasRole(this.authService, Role.Admin);
    // }

    // getRankingRuleSuffix(): string {
    //     return this.tournament.getCompetition().hasMultipleSports() ? '<small>per sport</small>' : '';
    // }

    // saveRankingRuleSet(againstRuleSet: AgainstRuleSet) {
    //     this.resetAlert();
    //     this.processing = true;
    //     const json = this.tournamentMapper.toJson(this.tournament);
    //     json.competition.againstRuleSet = againstRuleSet;
    //     this.tournamentRepository.editObject(json)
    //         .subscribe({
    //             next: (tournament: Tournament) => { this.tournament = tournament; },
    //             error: (e) => {
    //                 this.alert = { type: IAlertType.Danger, message: e }; this.processing = false;
    //             },
    //             complete: () => this.processing = false
    //         });
    // }
}
