import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { State, Competitor } from 'ngx-sport';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';

@Component({
    selector: 'app-tournament-ranking',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class RankingComponent extends TournamentComponent implements OnInit {
    activeTab: number;
    competitors: Competitor[];

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        protected favRepository: FavoritesRepository,
        protected authService: AuthService
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            const competitors = this.tournament.getCompetitors();
            this.competitors = this.favRepository.getObject(this.tournament).filterCompetitors(competitors);

            this.activeTab = 1;
            if (this.structure.getLastRoundNumber().getState() === State.Finished) {
                this.activeTab = 2;
            }
            this.processing = false;
        });
    }

    isAdmin(): boolean {
        return this.tournament.getUser(this.authService.getUser())?.hasRoles(Role.ADMIN);
    }
}
