import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StructureRepository } from 'voetbaljs/structure/repository';

import { AuthService } from '../../../auth/auth.service';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';
import { TournamentRole } from '../role';

@Component({
    selector: 'app-tournament-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.css']
})
export class TournamentViewComponent extends TournamentComponent implements OnInit {

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit();
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), TournamentRole.ADMIN);
    }
}
