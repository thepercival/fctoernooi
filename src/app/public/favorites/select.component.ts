import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';

@Component({
    selector: 'app-tournament-select-favorites',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss']
})
export class SelectFavoritesComponent extends TournamentComponent implements OnInit {
    public favorites!: Favorites;
    public structureNameService!: StructureNameService;

    @ViewChild('contentInfoModal', { static: true }) private contentInfoModal!: TemplateRef<any>;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private myNavigation: MyNavigation
    ) {
        super(route, router, tournamentRepository, sructureRepository, globalEventsManager, modalService, favRepository);
        this.resetAlert();
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.updateFavoriteCategories(this.structure);
            const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
            this.structureNameService = new StructureNameService(startLocationMap);
            this.favorites = this.favRepository.getObject(this.tournament, this.structure.getCategories());
            if (this.hasCompetitors() === false) {
                this.router.navigate(['/public/games', this.tournament.getId()]);
            } else {
                // toon modal 
                // @TODO CDK =========>
                // 1 wanneer nog geen cookie van dat toernooi, stuur dan naar favorites en laat een modal zijn
                // dat ze een favoriet kunnen kiezen en dat onderaan de navigatie zit!

                const shownNrOfBatchGamesAlert = localStorage.getItem('showSelectFavoriteModal' + this.tournament.getId());
                if (shownNrOfBatchGamesAlert === null) {
                    localStorage.setItem('showSelectFavoriteModal' + this.tournament.getId(), '1');
                    this.openHelpModal(this.contentInfoModal);
                }
            }
            this.processing = false;
        });
    }

    get FavoritesScreen(): TournamentScreen { return TournamentScreen.Favorites }

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
        activeModal.componentInstance.header = 'uitleg';
        activeModal.componentInstance.modalContent = modalContent;
        // activeModal.componentInstance.noHeaderBorder = true;
        activeModal.result.then((result) => {
            //  this.linkToPlanningConfig();
        }, (reason) => { });
    }

    navigateBack() {
        this.myNavigation.back();
    }
}
