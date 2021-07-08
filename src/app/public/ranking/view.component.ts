import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { State, AgainstRuleSet, CompetitorMap } from 'ngx-sport';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { Tournament } from '../../lib/tournament';
import { Favorites } from '../../lib/favorites';

@Component({
    selector: 'app-tournament-ranking',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class RankingComponent extends TournamentComponent implements OnInit {
    public activeTab: number = 1;
    public favorites!: Favorites;
    public competitorMap!: CompetitorMap;
    public againstRuleSet!: AgainstRuleSet;
    public hasBegun: boolean = true;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        protected tournamentMapper: TournamentMapper,
        structureRepository: StructureRepository,
        protected favRepository: FavoritesRepository,
        protected authService: AuthService
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.againstRuleSet = this.tournament.getCompetition().getAgainstRuleSet();
            this.competitorMap = new CompetitorMap(this.tournament.getCompetitors());
            this.favorites = this.favRepository.getObject(this.tournament);
            this.hasBegun = this.structure.getRootRound().hasBegun();
            if (this.structure.getLastRoundNumber().getState() === State.Finished) {
                this.activeTab = 2;
            }
            this.processing = false;
        });
    }

    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.ADMIN);
    }

    saveRankingRuleSet(againstRuleSet: AgainstRuleSet) {
        this.resetAlert();
        this.processing = true;
        const json = this.tournamentMapper.toJson(this.tournament);
        json.competition.againstRuleSet = againstRuleSet;
        this.tournamentRepository.editObject(json)
            .subscribe(
            /* happy path */(tournament: Tournament) => { this.tournament = tournament; },
            /* error path */ e => { this.alert = { type: 'danger', message: e }; this.processing = false; },
            /* onComplete */() => { this.processing = false; }
            );
    }
}
