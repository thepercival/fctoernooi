import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { League, SportConfigService, StructureRepository, PlanningRepository, RoundNumber } from 'ngx-sport';

import { AuthService } from '../../auth/auth.service';
import { CSSService } from '../../common/cssservice';
import { Role } from '../../lib/role';
import { Tournament } from '../../lib/tournament';
import { TournamentPrintConfig, TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';
import { TranslateService } from '../../lib/translate';

@Component({
    selector: 'app-tournament-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent extends TournamentComponent implements OnInit, AfterViewInit {
    nameForm: FormGroup;
    copyForm: FormGroup;
    printForm: FormGroup;
    shareForm: FormGroup;
    minDateStruct: NgbDateStruct;
    translate: TranslateService;
    allHavePlannings: boolean;

    constructor(
        route: ActivatedRoute,
        private modalService: NgbModal,
        public cssService: CSSService,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private sportConfigService: SportConfigService,
        private planningRepository: PlanningRepository,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.translate = new TranslateService();
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
            gamesperpoule: false,
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
        this.nameForm.controls.name.setValue(this.competition.getLeague().getName());
        this.copyForm.controls.date.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
        this.shareForm.controls.url.setValue('https://www.fctoernooi.nl/' + this.tournament.getId());
        this.shareForm.controls.public.setValue(this.tournament.getPublic());
        this.processing = false;

        const firstRoundNumber = this.structure.getFirstRoundNumber();
        this.allHavePlannings = this.haveAllPlannings(firstRoundNumber);
    }

    haveAllPlannings(roundNumber: RoundNumber): boolean {
        if (!roundNumber.hasNext() || !roundNumber.getHasPlanning()) {
            return roundNumber.getHasPlanning();
        }
        return this.haveAllPlannings(roundNumber.getNext());
    }

    ngAfterViewInit() {
        console.log('ngAfterViewInit');
    }

    competitorsComplete(): boolean {
        return this.structure.getFirstRoundNumber().getNrOfCompetitors() === this.structure.getFirstRoundNumber().getNrOfPlaces();
    }

    someCompetitorsRegistered(): boolean {
        const competitors = this.structure.getFirstRoundNumber().getCompetitors();
        return competitors.some(competitor => competitor.getRegistered()) && !competitors.every(competitor => competitor.getRegistered());
    }

    getFieldDescription(): string {
        const sports = this.competition.getSports();
        return this.translate.getFieldName(sports.length === 1 ? sports[0] : undefined);
    }

    getFieldsDescription(): string {
        const sports = this.competition.getSports();
        return this.translate.getFieldsName(sports.length === 1 ? sports[0] : undefined);
    }

    getNrOfFieldsDescription() {
        const nrOfFields = this.competition.getFields().length;
        if (nrOfFields === 1) {
            return '1 ' + this.getFieldDescription();
        }
        return nrOfFields + ' ' + this.getFieldsDescription();
    }

    getNrOfRefereesDescription() {
        const nrOfReferees = this.competition.getReferees().length;
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
        return this.competition.getSportConfigs().every(sportConfig => {
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
        return !this.printForm.value['gamenotes']
            && !this.printForm.value['structure'] && !this.printForm.value['planning']
            && !this.printForm.value['gamesperpoule'] && !this.printForm.value['gamesperfield'] && !this.printForm.value['rules']
            && !this.printForm.value['poulepivottables'] && !this.printForm.value['qrcode'];

    }

    openModalPrint(modalContent) {
        const activeModal = this.modalService.open(modalContent/*, { windowClass: 'border-warning' }*/);
        // (<TournamentListRemoveModalComponent>activeModal.componentInstance).place = place;
        activeModal.result.then((result) => {
            if (result === 'print') {
                const printConfig: TournamentPrintConfig = {
                    gamenotes: this.printForm.value['gamenotes'],
                    structure: this.printForm.value['structure'],
                    rules: this.printForm.value['rules'],
                    gamesperpoule: this.printForm.value['gamesperpoule'],
                    gamesperfield: this.printForm.value['gamesperfield'],
                    planning: this.printForm.value['planning'],
                    poulepivottables: this.printForm.value['poulepivottables'],
                    qrcode: this.printForm.value['qrcode']
                };

                const newWindow = window.open(this.tournamentRepository.getPrintUrl(this.tournament, printConfig));
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
        if (!this.competition.hasMultipleSportConfigs()) {
            this.router.navigate(['/toernooi/sportconfigedit'
                , this.tournament.getId(), this.competition.getFirstSportConfig().getId()]);
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
            this.competition.getStartDateTime().getHours(),
            this.competition.getStartDateTime().getMinutes(),
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
        this.competition.getLeague().setName(this.nameForm.controls.name.value);
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
