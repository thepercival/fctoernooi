import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { League, SportConfigService, StructureRepository } from 'ngx-sport';

import { AuthService } from '../../auth/auth.service';
import { CSSService } from '../../common/cssservice';
import { Role } from '../../lib/role';
import { Tournament } from '../../lib/tournament';
import { TournamentPrintConfig, TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent extends TournamentComponent implements OnInit {
    printConfig: TournamentPrintConfig;
    nameForm: FormGroup;
    copyForm: FormGroup;
    printForm: FormGroup;
    shareForm: FormGroup;
    minDateStruct: NgbDateStruct;

    constructor(
        route: ActivatedRoute,
        private modalService: NgbModal,
        public cssService: CSSService,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private sportConfigService: SportConfigService,

        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.printConfig = {
            gamenotes: true,
            structure: false,
            rules: false,
            gamesperfield: false,
            planning: false,
            poulepivottables: false,
            qrcode: true
        };
        const date = new Date();
        this.minDateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
        this.nameForm = fb.group({
            name: ['', Validators.compose([
                Validators.required,
                Validators.minLength(League.MIN_LENGTH_NAME),
                Validators.maxLength(League.MAX_LENGTH_NAME)
            ])]
        });
        this.copyForm = fb.group({
            date: ['', Validators.compose([
            ])]
        });
        this.shareForm = fb.group({
            url: [{ value: '', disabled: true }, Validators.compose([
            ])],
            public: ['', Validators.compose([
            ])]
        });
        this.printForm = fb.group({
            gamenotes: true,
            structure: false,
            rules: false,
            gamesperfield: false,
            planning: false,
            poulepivottables: false,
            qrcode: true
        });
    }

    ngOnInit() {
        super.myNgOnInit(() => this.postNgOnInit());
    }

    postNgOnInit() {
        const date = new Date();
        this.nameForm.controls.name.setValue(this.tournament.getCompetition().getLeague().getName());
        this.copyForm.controls.date.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
        this.shareForm.controls.url.setValue('https://www.fctoernooi.nl/' + this.tournament.getId());
        this.shareForm.controls.public.setValue(this.tournament.getPublic());
        this.processing = false;
    }

    competitorsComplete(): boolean {
        return this.structure.getFirstRoundNumber().getNrOfCompetitors() === this.structure.getFirstRoundNumber().getNrOfPlaces();
    }

    someCompetitorsRegistered(): boolean {
        const competitors = this.structure.getFirstRoundNumber().getCompetitors();
        return competitors.some(competitor => competitor.getRegistered()) && !competitors.every(competitor => competitor.getRegistered());
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

    sportConfigsAreDefault() {
        return this.tournament.getCompetition().getSportConfigs().every(sportConfig => {
            return this.sportConfigService.isDefault(sportConfig);
        });
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), Role.ADMIN);
    }

    remove() {
        this.setAlert('info', 'het toernooi wordt verwijderd');
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
                        this.setAlert('danger', 'het toernooi kon niet verwijderd worden');
                        this.processing = false;
                    }
                    // redirect to home with message
                },
                /* error path */ e => {
                    this.setAlert('danger', 'het toernooi kon niet verwijderd worden');
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

    allPrintOptionsOff() {
        return (!this.printConfig.gamenotes && !this.printConfig.structure && !this.printConfig.planning &&
            !this.printConfig.gamesperfield && !this.printConfig.rules && !this.printConfig.poulepivottables
            && !this.printConfig.qrcode);

    }

    openModalPrint(modalContent) {
        const activeModal = this.modalService.open(modalContent/*, { windowClass: 'border-warning' }*/);
        // (<TournamentListRemoveModalComponent>activeModal.componentInstance).place = place;
        activeModal.result.then((result) => {
            if (result === 'print') {
                const newWindow = window.open(this.tournamentRepository.getPrintUrl(this.tournament, this.printConfig));
            }
        }, (reason) => {
        });
    }

    openModalName(modalContent) {
        const activeModal = this.modalService.open(modalContent/*, { windowClass: 'border-warning' }*/);
        // (<TournamentListRemoveModalComponent>activeModal.componentInstance).place = place;
        activeModal.result.then((result) => {
            if (result === 'save') {
                this.saveName();
            }
        }, (reason) => {
        });
    }

    openModalCopy(modalContent) {
        const activeModal = this.modalService.open(modalContent/*, { windowClass: 'border-warning' }*/);
        // (<TournamentListRemoveModalComponent>activeModal.componentInstance).place = place;
        activeModal.result.then((result) => {
            if (result === 'copy') {
                this.copy();
            }
        }, (reason) => {
        });
    }

    openModalRemove(modalContent) {
        const activeModal = this.modalService.open(modalContent/*, { windowClass: 'border-warning' }*/);
        // (<TournamentListRemoveModalComponent>activeModal.componentInstance).place = place;
        activeModal.result.then((result) => {
            if (result === 'remove') {
                this.remove();
            }
        }, (reason) => {
        });
    }

    openModalShare(modalContent) {
        const activeModal = this.modalService.open(modalContent/*, { windowClass: 'border-warning' }*/);
        // (activeModal.componentInstance).copied = false;
        activeModal.result.then((result) => {
            if (result === 'share') {
                this.share();
            }
        }, (reason) => {
        });
    }

    linkToStructure() {
        this.router.navigate(['/toernooi/structure', this.tournament.getId()]);
    }

    linkToSportConfig() {
        if (!this.tournament.getCompetition().hasMultipleSportConfigs()) {
            this.router.navigate(['/toernooi/sportconfigedit'
                , this.tournament.getId(), this.tournament.getCompetition().getFirstSportConfig().getId()]);
        } else {
            this.router.navigate(['/toernooi/sportconfigs', this.tournament.getId()]);
        }
    }

    getCurrentYear() {
        const date = new Date();
        return date.getFullYear();
    }

    copy() {
        this.setAlert('info', 'de nieuwe editie wordt aangemaakt');
        const startDateTime = new Date(
            this.copyForm.controls.date.value.year,
            this.copyForm.controls.date.value.month - 1,
            this.copyForm.controls.date.value.day,
            this.tournament.getCompetition().getStartDateTime().getHours(),
            this.tournament.getCompetition().getStartDateTime().getMinutes(),
        );

        this.processing = true;
        this.tournamentRepository.copyObject(this.tournament, startDateTime)
            .subscribe(
                /* happy path */(newTournamentId: number) => {
                    this.router.navigate(['/toernooi', newTournamentId]);
                    this.setAlert('success', 'de nieuwe editie is aangemaakt, je bevindt je nu in de nieuwe editie');
                },
                /* error path */ e => {
                    this.setAlert('danger', 'er kon geen nieuwe editie worden aangemaakt');
                    this.processing = false;
                },
                /* onComplete */() => { this.processing = false; }
            );
    }

    equals(one: NgbDateStruct, two: NgbDateStruct) {
        return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
    }
    isSelected = date => this.equals(date, this.copyForm.controls.date.value);

    share() {
        this.setAlert('info', 'het delen wordt gewijzigd');

        this.processing = true;
        this.tournament.setPublic(this.shareForm.controls.public.value);
        this.tournamentRepository.editObject(this.tournament)
            .subscribe(
                /* happy path */(tournamentRes: Tournament) => {
                    this.tournament = tournamentRes;
                    // this.router.navigate(['/toernooi', newTournamentId]);
                    this.setAlert('success', 'het delen is gewijzigd');
                },
                /* error path */ e => {
                    this.setAlert('danger', 'het delen kon niet worden gewijzigd');
                    this.processing = false;
                },
                /* onComplete */() => { this.processing = false; }
            );
    }

    saveName() {
        this.setAlert('info', 'de naam wordt opgeslagen');

        this.processing = true;
        this.tournament.getCompetition().getLeague().setName(this.nameForm.controls.name.value);
        this.tournamentRepository.editObject(this.tournament)
            .subscribe(
                /* happy path */(tournamentRes: Tournament) => {
                    this.tournament = tournamentRes;
                    // this.router.navigate(['/toernooi', newTournamentId]);
                    this.setAlert('success', 'de naam is opgeslagen');
                },
                /* error path */ e => {
                    this.setAlert('danger', 'de naam kon niet worden opgeslagen');
                    this.processing = false;
                },
                /* onComplete */() => { this.processing = false; }
            );
    }
}
