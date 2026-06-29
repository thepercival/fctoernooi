import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Referee, StructureNameService, StartLocationMap } from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { LockerRoom } from '../../lib/lockerroom';
import { TournamentCompetitor } from '../../lib/competitor';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { WebsitePart } from '../../shared/tournament/structure/admin-public-switcher.component';
import { CompetitorTab } from '../../shared/common/tab-ids';
import { AdminPublicSwitcherComponent } from '../../shared/tournament/structure/admin-public-switcher.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlert, NgbNav, NgbNavContent, NgbNavItem, NgbNavLink, NgbNavOutlet } from '@ng-bootstrap/ng-bootstrap';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { CompetitorsCategoryComponent } from './category.component';
import { CommonModule } from '@angular/common';
import { facReferee } from '../../shared/customicons';

@Component({
    selector: 'app-tournament-select-favorites',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
    imports: [AdminPublicSwitcherComponent, FontAwesomeModule, NgbAlert, NgbNav, NgbNavItem, NgbNavLink, NgbNavContent, NgbNavOutlet, TournamentNavBarComponent, CompetitorsCategoryComponent, CommonModule]
    
})
export class SelectFavoritesComponent extends TournamentComponent implements OnInit {
    facReferee = facReferee;
    public favorites!: Favorites;
    public structureNameService!: StructureNameService;
    public showLockerRoom = false;
    public lockerRoomMap: Map<string, string> = new Map();

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        private myNavigation: MyNavigation,
        private authService: AuthService,
    ) {
        super(route, router, tournamentRepository, sructureRepository, globalEventsManager);
        this.alert.set(undefined);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.updateFavoriteCategories(this.structure);
            const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
            this.structureNameService = new StructureNameService(startLocationMap);
            this.favorites = this.favRepository.getObject(this.tournament, this.structure.getCategories());
            if (this.hasCompetitors() === false) {
                this.router.navigate(['/public/games', this.tournament.getId()], {
                    skipLocationChange: true 
                });
                return;
            }
            
            this.fillMap();
            this.showLockerRoom = this.tournament.getLockerRooms().length > 0;
            this.processing.set(false);
        });
    }

    get CompetitorTabBase(): CompetitorTab { return CompetitorTab .Base; }
    get FavoritesScreen(): TournamentScreen { return TournamentScreen.Favorites }
    get PublicWebsitePart(): WebsitePart { return WebsitePart.Public }

    hasCompetitors() {
        return this.tournament.getCompetitors().length > 0;
    }

    save() {
        this.myNavigation.back();
    }

    toggleFavoriteReferee(referee: Referee) {
        if (this.favorites.hasReferee(referee)) {
            this.favorites.removeReferee(referee);
        } else {
            this.favorites.addReferee(referee);
        }
        this.favRepository.editObject(this.favorites);
    }

    hasReferees() {
        return this.competition.getReferees().length > 0;
    }

    openHelpModal(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
            activeModal.componentInstance.header = () => 'uitleg';
            activeModal.componentInstance.modalContent = () => modalContent;
        // activeModal.componentInstance.noHeaderBorder = true;
        activeModal.result.then(() => {
            //  this.linkToPlanningConfig();
        }, () => { });
    }

    fillMap(): void {
        const competitors = this.tournament.getCompetitors();
        competitors.forEach((competitor: TournamentCompetitor) => {
            const lockerRooms = this.tournament.getLockerRooms().filter((lockerRoom: LockerRoom): boolean => {
                return lockerRoom.hasCompetitor(competitor);
            });
            const descr = lockerRooms.map(lockerRoom => lockerRoom.getName()).join(', ');
            this.lockerRoomMap.set('comp-' + competitor.getId(), descr);
        });        
    }

    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.Admin);
    }

    navigateBack() {
        this.myNavigation.back();
    }
}
