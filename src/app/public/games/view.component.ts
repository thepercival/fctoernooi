import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { Category, RoundNumber, SelfReferee, StartLocationMap, Structure, StructureNameService } from 'ngx-sport';
import { Favorites } from '../../lib/favorites';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { OptionalGameColumn } from '../../shared/tournament/games/roundnumber.component';
import { TournamentCompetitor } from '../../lib/competitor';
import { WebsitePart } from '../../shared/tournament/structure/admin-public-switcher.component';
import { AdminPublicSwitcherComponent } from '../../shared/tournament/structure/admin-public-switcher.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { RoundNumberPlanningComponent } from '../../shared/tournament/games/roundnumber.component';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-games-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AdminPublicSwitcherComponent, FontAwesomeModule, NgbAlert, RoundNumberPlanningComponent, TournamentNavBarComponent]
    
})
export class GamesComponent extends TournamentComponent implements OnInit {
    faSpinner = faSpinner;
    userRefereeId: number | string | undefined;
    public hasRefereeRole: boolean = false;
    public structureNameService!: StructureNameService;
    refreshingData = false;
    public favorites!: Favorites;
    public categoryMap: Map<number, Category> = new Map();
    public optionalGameColumns: Map<OptionalGameColumn, boolean> = new Map(); 

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        private myNavigation: MyNavigation,
        private authService: AuthService,
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            const loggedInUserId = this.authService.getLoggedInUserId();
            const tournamentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
            const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
            this.structureNameService = new StructureNameService(startLocationMap);
            this.updateFavoriteCategories(this.structure);
            this.favorites = this.favRepository.getObject(this.tournament, this.structure.getCategories());
            this.initGameColumnDefinitions(this.structure);
            if (tournamentUser && tournamentUser.hasRole(Role.Referee)) {
                this.hasRefereeRole = true;
                this.tournamentRepository.getUserRefereeId(this.tournament)
                    .subscribe({
                        next: (userRefereeId: number | string) => {
                            this.userRefereeId = userRefereeId;
                            this.processing.set(false);
                        },
                        error: () => this.processing.set(false)
                    });
            } else {
                this.processing.set(false);
            }
        });
    }

    private initGameColumnDefinitions(structure: Structure): void {
        let roundNumbers = structure.getRoundNumbers();

        const enableTime = roundNumbers.some((roundNumber: RoundNumber): boolean => {
            return roundNumber.getValidPlanningConfig().getEnableTime();
        });
        this.optionalGameColumns.set(OptionalGameColumn.Start, enableTime);

        const nrOfReferees = this.tournament.getCompetition().getReferees().length;
        const hasSomeReferees = roundNumbers.some((roundNumber: RoundNumber): boolean => {
            return nrOfReferees > 0 || roundNumber.getValidPlanningConfig().getSelfReferee() !== SelfReferee.Disabled
        });
        this.optionalGameColumns.set(OptionalGameColumn.Referee, hasSomeReferees);
    }

    get GamesScreen(): TournamentScreen { return TournamentScreen.Games }
    get PublicWebsitePart(): WebsitePart { return WebsitePart.Public } 
    get RefereeRole(): Role { return Role.Referee }

    scroll() {
        this.myNavigation.scroll();
    }

    isAdmin(): boolean {
        return this.authService.loggedInUserHasRole(this.tournament, Role.Admin);
    }

    refreshData() {
        this.refreshingData = true;
        this.setData(this.tournament.getId(), () => {
            this.myNavigation.updateScrollPosition();
            this.refreshingData = false;
        });
    }
}
