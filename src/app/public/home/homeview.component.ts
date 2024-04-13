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
import { SponsorRepository } from '../../lib/sponsor/repository';
import { Sponsor } from '../../lib/sponsor';
import { IAlertType } from '../../shared/common/alert';

@Component({
    selector: 'app-tournament-home-view',
    templateUrl: './homeview.component.html',
    styleUrls: ['./homeview.component.scss']
})
export class HomeViewComponent extends TournamentComponent implements OnInit {
    public rules: JsonTournamentRule[] = [];

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private sponsorRepository: SponsorRepository,
        private rulesRepository: TournamentRuleRepository,
        protected tournamentMapper: TournamentMapper,
        protected authService: AuthService
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
           
            this.rulesRepository.getObjects(this.tournament)
                .subscribe({
                    next: (rules: JsonTournamentRule[]) => {
                        this.rules = rules

                        this.processing = false;
                    },
                    error: (e) => {
                        this.setAlert(IAlertType.Danger, e); this.processing = false;
                    }
                });
        });
    }

    get HomeScreen(): TournamentScreen { return TournamentScreen.Home }

    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.Admin);
    }

    locationIsCoordinate(location: string|undefined): boolean {
        if (location === undefined) {
            return false;
        }
        const parts = location.split(',')
        return parts.length === 2 && parts.every((part: string) => !isNaN(+part) );
    }

    getMapsUrl(location: string|undefined): string {

        if (location === undefined ) {
            return '#';
        }
        if (this.locationIsCoordinate(location) ) {
            return 'https://www.google.com/maps/place/' + location;
        }
        return 'https://maps.google.com/?q=' + location;
    }

    getSponsorLogoUrl(sponsor: Sponsor): string {
        return this.sponsorRepository.getLogoUrl(sponsor, 200);
    }
}
