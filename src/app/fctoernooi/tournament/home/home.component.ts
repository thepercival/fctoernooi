import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StructureRepository } from 'ngx-sport';

import { IAlert } from '../../../app.definitions';
import { AuthService } from '../../../auth/auth.service';
import { TournamentComponent } from '../component';
import { TournamentPrintConfig, TournamentRepository } from '../repository';
import { TournamentRole } from '../role';

@Component({
    selector: 'app-tournament-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class TournamentHomeComponent extends TournamentComponent implements OnInit {
    alertRemove: IAlert;
    printConfig: TournamentPrintConfig;

    constructor(
        route: ActivatedRoute,
        private modalService: NgbModal,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.printConfig = {
            gamenotes: true,
            structure: false,
            rules: false,
            gamesperfield: false,
            planning: false,
            poulepivottables: false
        };
    }

    ngOnInit() {
        super.myNgOnInit(() => this.postNgOnInit());
    }

    postNgOnInit() {
        this.processing = false;
    }

    getNrOfFieldsDescription() {
        const nrOfFields = this.tournament.getCompetition().getFields().length;
        if (nrOfFields === 0) {
            return 'geen velden';
        } else if (nrOfFields === 1) {
            return '1 veld';
        }
        return nrOfFields + ' velden';
    }

    getNrOfRefereesDescription() {
        const nrOfReferees = this.tournament.getCompetition().getReferees().length;
        if (nrOfReferees === 0) {
            return 'geen scheidsrechters';
        } else if (nrOfReferees === 1) {
            return '1 scheidsrechter';
        }
        return nrOfReferees + ' scheidsrechters';
    }

    getNrOfSponsorsDescription() {
        const nrOfSponsors = this.tournament.getSponsors().length;
        if (nrOfSponsors === 0) {
            return 'geen sponsors';
        } else if (nrOfSponsors === 1) {
            return '1 sponsor';
        }
        return nrOfSponsors + ' sponsors';
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), TournamentRole.ADMIN);
    }

    remove() {
        this.setRemoveAlert('info', 'het toernooi wordt verwijderd');
        this.processing = true;
        this.tournamentRepository.removeObject(this.tournament)
            .subscribe(
                /* happy path */(deleted: boolean) => {
                    if (deleted) {
                        const navigationExtras: NavigationExtras = {
                            queryParams: { type: 'success', message: 'het toernooi is verwijderd' }
                        };
                        this.router.navigate(['/'], navigationExtras);
                    } else {
                        this.setRemoveAlert('danger', 'het toernooi kon niet verwijderd worden');
                        this.processing = false;
                    }
                    // redirect to home with message
                },
                /* error path */ e => {
                    this.setRemoveAlert('danger', 'het toernooi kon niet verwijderd worden');
                    this.processing = false;
                },
                /* onComplete */() => { this.processing = false; }
            );
    }

    isManualMessageReadOnDevice() {
        let manualMessageReadOnDevice = localStorage.getItem('manualmessageread');
        if (manualMessageReadOnDevice === null) {
            manualMessageReadOnDevice = 'false';
        }
        return JSON.parse(manualMessageReadOnDevice);
    }

    manualMessageReadOnDevice() {
        localStorage.setItem('manualmessageread', JSON.stringify(true));
    }

    protected setRemoveAlert(type: string, message: string) {
        this.alertRemove = { 'type': type, 'message': message };
    }

    protected resetRemoveAlert(): void {
        this.alertRemove = undefined;
    }

    allPrintOptionsOff() {
        return (!this.printConfig.gamenotes && !this.printConfig.structure && !this.printConfig.planning &&
            !this.printConfig.gamesperfield && !this.printConfig.rules && !this.printConfig.poulepivottables);
    }

    openModalPrint(modalContent) {
        const activeModal = this.modalService.open(modalContent/*, { windowClass: 'border-warning' }*/);
        // (<TournamentListRemoveModalComponent>activeModal.componentInstance).poulePlace = poulePlace;
        activeModal.result.then((result) => {
            if (result === 'print') {
                const newWindow = window.open(this.tournamentRepository.getPrintUrl(this.tournament, this.printConfig));
            }
        }, (reason) => {
        });
    }

    openModalRemove(modalContent) {
        const activeModal = this.modalService.open(modalContent/*, { windowClass: 'border-warning' }*/);
        // (<TournamentListRemoveModalComponent>activeModal.componentInstance).poulePlace = poulePlace;
        activeModal.result.then((result) => {
            if (result === 'remove') {
                this.remove();
            }
        }, (reason) => {
        });
    }

    openModalShare(modalContent) {
        const activeModal = this.modalService.open(modalContent/*, { windowClass: 'border-warning' }*/);
        // (<TournamentListRemoveModalComponent>activeModal.componentInstance).poulePlace = poulePlace;
        activeModal.result.then((result) => {
            // if (result === 'remove') {
            //     this.remove();
            // }
        }, (reason) => {
        });
    }
}
