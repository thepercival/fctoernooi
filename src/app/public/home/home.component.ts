import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from '../../lib/auth/auth.service';
import { CSSService } from '../../shared/common/cssservice';
import { Role } from '../../lib/role';
import { TournamentComponent } from '../../shared/tournament/component';
import { TranslateService } from '../../lib/translate';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { LockerRoomValidator } from '../../lib/lockerroom/validator';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { Favorites } from '../../lib/favorites';

@Component({
    selector: 'app-tournament-public',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent extends TournamentComponent implements OnInit {
    translate: TranslateService;
    allHavePlannings: boolean;
    lockerRoomValidator: LockerRoomValidator;
    favorites: Favorites;

    constructor(
        route: ActivatedRoute,
        private modalService: NgbModal,
        public cssService: CSSService,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        public favRepository: FavoritesRepository
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.translate = new TranslateService();
    }

    ngOnInit() {
        super.myNgOnInit(() => this.postNgOnInit());
    }

    postNgOnInit() {
        const competitors = this.structure.getFirstRoundNumber().getCompetitors();
        this.lockerRoomValidator = new LockerRoomValidator(competitors, this.tournament.getLockerRooms());
        this.favorites = this.favRepository.getItem(this.tournament);
        this.processing = false;
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.ADMIN);
    }
}
