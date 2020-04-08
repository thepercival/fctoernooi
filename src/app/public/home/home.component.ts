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

@Component({
    selector: 'app-tournament-public',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent extends TournamentComponent implements OnInit {
    translate: TranslateService;
    allHavePlannings: boolean;
    lockerRoomValidator: LockerRoomValidator;

    constructor(
        route: ActivatedRoute,
        private modalService: NgbModal,
        public cssService: CSSService,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.translate = new TranslateService();
        const competitors = this.structure.getFirstRoundNumber().getCompetitors();
        this.lockerRoomValidator = new LockerRoomValidator(competitors, this.tournament.getLockerRooms());
    }

    ngOnInit() {
        super.myNgOnInit(() => this.postNgOnInit());
    }

    postNgOnInit() {
        this.processing = false;
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.ADMIN);
    }
}
