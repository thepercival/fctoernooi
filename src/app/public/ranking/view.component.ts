import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';

@Component({
    selector: 'app-tournament-ranking',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class RankingComponent extends TournamentComponent implements OnInit {
    shouldShowEndRanking: boolean;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private myNavigation: MyNavigation,
        private authService: AuthService
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.shouldShowEndRanking = (this.structure.getFirstRoundNumber().hasNext()
                || this.structure.getRootRound().getPoules().length === 1);
        });
    }

    scroll() {
        this.myNavigation.scroll();
    }

    isAdmin(): boolean {
        return this.tournament && this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.ADMIN);
    }
}
