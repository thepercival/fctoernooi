import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { AgainstRuleSet, Category, GameState, StartLocationMap, Structure, StructureNameService } from 'ngx-sport';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { Tournament } from '../../lib/tournament';
import { Favorites } from '../../lib/favorites';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';

@Component({
    selector: 'app-tournament-ranking',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class RankingComponent extends TournamentComponent implements OnInit {
    public activeTab: number = 1;
    public favorites!: Favorites;
    public structureNameService!: StructureNameService;
    public againstRuleSet!: AgainstRuleSet;
    public hasBegun: boolean = true;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        protected tournamentMapper: TournamentMapper,
        protected favRepository: FavoritesRepository,
        protected authService: AuthService
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.againstRuleSet = this.tournament.getCompetition().getAgainstRuleSet();
            const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
            this.structureNameService = new StructureNameService(startLocationMap);
            this.favorites = this.favRepository.getObject(this.tournament);
            this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
            if (this.structure.getLastRoundNumber().getGamesState() === GameState.Finished) {
                this.activeTab = 2;
            }
            this.processing = false;
        });
    }

    // @TODO CDK CATEGORY - REMOVE FUNCTION
    getDefaultCategory(structure: Structure): Category {
        return structure.getCategories()[0];
    }

    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.ADMIN);
    }

    getRankingRuleSuffix(): string {
        return this.tournament.getCompetition().hasMultipleSports() ? '<small>per sport</small>' : '';
    }

    saveRankingRuleSet(againstRuleSet: AgainstRuleSet) {
        this.resetAlert();
        this.processing = true;
        const json = this.tournamentMapper.toJson(this.tournament);
        json.competition.againstRuleSet = againstRuleSet;
        this.tournamentRepository.editObject(json)
            .subscribe({
                next: (tournament: Tournament) => { this.tournament = tournament; },
                error: (e) => {
                    this.alert = { type: IAlertType.Danger, message: e }; this.processing = false;
                },
                complete: () => this.processing = false
            });
    }
}
