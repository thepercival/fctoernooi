import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Competitor } from 'ngx-sport';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { LiveboardLink } from '../../lib/liveboard/link';

@Component({
    selector: 'app-tournament-public',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent extends TournamentComponent implements OnInit, OnDestroy {
    private liveboardLinkSet = false;
    translate: TranslateService;
    allHavePlannings: boolean;
    lockerRoomValidator: LockerRoomValidator;
    competitors: Competitor[];
    favorites: Favorites;

    constructor(
        route: ActivatedRoute,
        private modalService: NgbModal,
        public cssService: CSSService,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        public favRepository: FavoritesRepository,
        private globalEventsManager: GlobalEventsManager
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.translate = new TranslateService();
    }

    ngOnInit() {
        super.myNgOnInit(() => this.postNgOnInit());
    }

    postNgOnInit() {
        this.competitors = this.structure.getFirstRoundNumber().getCompetitors();
        this.lockerRoomValidator = new LockerRoomValidator(this.competitors, this.tournament.getLockerRooms());
        this.favRepository.removeNonExisting(this.tournament, this.competitors, this.competition.getReferees());
        this.favorites = this.favRepository.getItem(this.tournament);
        this.initLiveboardLink();
        this.processing = false;
    }

    isAnAdmin(): boolean {
        return this.tournament.getUser(this.authService.getUser())?.hasARole(Role.ADMIN + Role.ROLEADMIN + Role.GAMERESULTADMIN);
    }

    lockerRoomDescription(): string {
        if (this.favorites.getNrOfCompetitors() === 0) {
            return 'geen deelnemer ingesteld';
        }
        const lockerRooms = this.favorites.filterLockerRooms(this.tournament.getLockerRooms());
        if (lockerRooms.length == 0) {
            return 'nog niet ingedeeld';
        } else if (lockerRooms.length <= 2) {
            const name = lockerRooms.length === 1 ? '' : 's';
            return 'kleedkamer' + name + ' ' + lockerRooms.map(lockerRoom => lockerRoom.getName()).join(' & ');
        }

        return 'meerdere kleedkamers';
    }

    filterDescription(): string {

        if (!this.favorites.hasItems()) {
            return 'deelnemer' + (this.tournament.getCompetition().getReferees().length > 0 ? ' of scheidsrechter' : '') + ' instellen';
        }
        if (this.favorites.hasCompetitors() && this.favorites.hasReferees()) {
            return 'meerdere filters ingesteld';
        }
        if (this.favorites.hasCompetitors()) {
            const competitors = this.favorites.filterCompetitors(this.competitors);
            if (competitors.length === 1) {
                return 'deelnemer <span class="font-weight-bold">' + competitors.pop().getName() + '</span> ingesteld';
            }
            return 'meerdere deelnemers ingesteld';
        }
        const referees = this.favorites.filterReferees(this.competition.getReferees());
        if (referees.length === 1) {
            return 'scheidsrechter <span class="font-weight-bold">' + referees.pop().getInitials() + '</span> ingesteld';
        }
        return 'meerdere scheidsrechters ingesteld';
    }

    ngOnDestroy() {
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit({});
    }

    initLiveboardLink() {
        if (this.liveboardLinkSet === true) {
            return;
        }
        const link: LiveboardLink = { showIcon: true, tournamentId: this.tournament.getId(), link: '/public/liveboard' };
        this.globalEventsManager.toggleLiveboardIconInNavBar.emit(link);
        this.liveboardLinkSet = true;
    }
}
