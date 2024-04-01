import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TournamentRuleRepository } from '../../lib/tournament/rule/repository';
import { JsonTournamentRule } from '../../lib/tournament/rule/json';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-tournament-home-view',
    templateUrl: './homeview.component.html',
    styleUrls: ['./homeview.component.scss']
})
export class HomeViewComponent extends TournamentComponent implements OnInit {
    public rules!: Observable<JsonTournamentRule[]>;    

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private rulesRepository: TournamentRuleRepository,
        protected tournamentMapper: TournamentMapper,
        protected authService: AuthService
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
           
            this.rules = this.rulesRepository.getObjects(this.tournament);
            this.processing = false;
        });
    }

    get HomeScreen(): TournamentScreen { return TournamentScreen.Home }

    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.Admin);
    }
}
