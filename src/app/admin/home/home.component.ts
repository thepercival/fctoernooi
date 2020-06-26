import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { League, SportConfigService, RoundNumber } from 'ngx-sport';

import { AuthService } from '../../lib/auth/auth.service';
import { CSSService } from '../../shared/common/cssservice';
import { Role } from '../../lib/role';
import { Tournament } from '../../lib/tournament';
import { TournamentExportConfig, TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { TranslateService } from '../../lib/translate';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { NameModalComponent } from '../../shared/tournament/namemodal/namemodal.component';
import { LockerRoomValidator } from '../../lib/lockerroom/validator';
import { SportConfigRouter } from '../../shared/tournament/sportconfig.router';

@Component({
    selector: 'app-tournament-admin',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent extends TournamentComponent implements OnInit {
    copyForm: FormGroup;
    exportForm: FormGroup;
    shareForm: FormGroup;
    minDateStruct: NgbDateStruct;
    translate: TranslateService;
    allHavePlannings: boolean;
    oldStructureRequested: boolean;
    lockerRoomValidator: LockerRoomValidator;

    constructor(
        route: ActivatedRoute,
        private sportConfigRouter: SportConfigRouter,
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
        this.translate = new TranslateService();
        const date = new Date();
        this.minDateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };

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

        this.exportForm = fb.group({
            gamenotes: true,
            structure: false,
            rules: false,
            gamesperpoule: false,
            gamesperfield: false,
            planning: false,
            poulepivottables: false,
            lockerrooms: false,
            qrcode: false
        });
    }

    ngOnInit() {
        super.myNgOnInit(() => this.postNgOnInit());
    }

    postNgOnInit() {
        const date = new Date();
        this.copyForm.controls.date.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
        this.shareForm.controls.url.setValue(location.origin + '/' + this.tournament.getId());
        this.shareForm.controls.public.setValue(this.tournament.getPublic());

        const competitors = this.structure.getFirstRoundNumber().getCompetitors();
        this.lockerRoomValidator = new LockerRoomValidator(competitors, this.tournament.getLockerRooms());
        this.exportForm.controls.lockerrooms.setValue(this.lockerRoomValidator.areSomeArranged());
        this.exportForm.controls.qrcode.setValue(this.tournament.getPublic());

        this.processing = false;
    }

    protected allArranged(): boolean {
        return this.structure.getRootRound().getCompetitors().every(competitor => {
            return this.tournament.getLockerRooms().some(lockerRoom => {
                return lockerRoom.hasCompetitor(competitor);
            });
        });
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
        return this.translate.getFieldNameSingular(sports.length === 1 ? sports[0] : undefined);
    }

    getFieldsDescription(): string {
        const sports = this.competition.getSports();
        return this.translate.getFieldNamePlural(sports.length === 1 ? sports[0] : undefined);
    }

    getNrOfFieldsDescription() {
        const nrOfFields = this.competition.getFields().length;
        if (nrOfFields < 2) {
            return nrOfFields + ' ' + this.getFieldDescription();
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
        return this.isAdminHelper(Role.ADMIN);
    }

    isRoleAdmin(): boolean {
        return this.isAdminHelper(Role.ROLEADMIN);
    }

    isRefereeOrGameResultAdmin(): boolean {
        return this.isAdminHelper(Role.GAMERESULTADMIN + Role.REFEREE);
    }

    protected isAdminHelper(roles: number) {
        return this.tournament.getUser(this.authService.getUser())?.hasARole(roles);
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

    allExportOptionsOff() {
        return !this.exportForm.value['gamenotes']
            && !this.exportForm.value['structure'] && !this.exportForm.value['planning']
            && !this.exportForm.value['gamesperpoule'] && !this.exportForm.value['gamesperfield'] && !this.exportForm.value['rules']
            && !this.exportForm.value['poulepivottables'] && !this.exportForm.value['lockerrooms'] && !this.exportForm.value['qrcode'];
    }

    openModalExport(modalContent) {
        const activeModal = this.modalService.open(modalContent);
        activeModal.result.then((result: string) => {
            if (result === 'export-pdf' || result === 'export-excel') {
                const exportConfig: TournamentExportConfig = {
                    gamenotes: this.exportForm.value['gamenotes'],
                    structure: this.exportForm.value['structure'],
                    rules: this.exportForm.value['rules'],
                    gamesperpoule: this.exportForm.value['gamesperpoule'],
                    gamesperfield: this.exportForm.value['gamesperfield'],
                    planning: this.exportForm.value['planning'],
                    poulepivottables: this.exportForm.value['poulepivottables'],
                    lockerRooms: this.exportForm.value['lockerrooms'],
                    qrcode: this.exportForm.value['qrcode']
                };

                const exportType = result.substr(7);
                this.processing = true;
                this.tournamentRepository.getExportUrl(this.tournament, exportType, exportConfig)
                    .subscribe(
                /* happy path */(url: string) => {
                            window.open(url);
                        },
                /* error path */ e => {
                            this.setAlert('danger', 'het exporteren is niet gelukt');
                            this.processing = false;
                        },
                /* onComplete */() => { this.processing = false; }
                    );
            }
        }, (reason) => {
        });
    }

    openModalName() {
        const activeModal = this.modalService.open(NameModalComponent);
        activeModal.componentInstance.header = 'toernooinaam';
        activeModal.componentInstance.range = { min: League.MIN_LENGTH_NAME, max: League.MAX_LENGTH_NAME };
        activeModal.componentInstance.initialName = this.competition.getLeague().getName();
        activeModal.componentInstance.labelName = this.competition.getLeague().getName();
        activeModal.componentInstance.buttonName = 'wijzigen';

        activeModal.result.then((result) => {
            this.saveName(result);
        }, (reason) => {
        });
    }

    openModalCopy(modalContent) {
        const activeModal = this.modalService.open(modalContent, { scrollable: false });
        activeModal.result.then((result) => {
            if (result === 'copy') {
                this.copy();
            }
        }, (reason) => {
        });
    }

    openModalRemove(modalContent) {
        const activeModal = this.modalService.open(modalContent);
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
        this.router.navigate(['/admin/structure', this.tournament.getId()]);
    }

    linkToSportConfig() {
        this.sportConfigRouter.navigate(this.tournament);
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
                    this.router.navigate(['/admin', newTournamentId]);
                    this.setAlert('success', 'de nieuwe editie is aangemaakt, je bevindt je nu in de nieuwe editie');
                },
                /* error path */ e => {
                    this.setAlert('danger', 'er kon geen nieuwe editie worden aangemaakt : ' + e);
                    this.processing = false;
                },
                /* onComplete */() => { this.processing = false; }
            );
    }

    share() {
        this.setAlert('info', 'het delen wordt gewijzigd');

        this.processing = true;
        this.tournament.setPublic(this.shareForm.controls.public.value);
        this.tournamentRepository.editObject(this.tournament)
            .subscribe(
                /* happy path */(tournamentRes: Tournament) => {
                    this.tournament = tournamentRes;
                    // this.router.navigate(['/admin', newTournamentId]);
                    this.setAlert('success', 'het delen is gewijzigd');
                },
                /* error path */ e => {
                    this.setAlert('danger', 'het delen kon niet worden gewijzigd');
                    this.processing = false;
                },
                /* onComplete */() => { this.processing = false; }
            );
    }

    saveName(newName: string) {
        this.setAlert('info', 'de naam wordt opgeslagen');

        this.processing = true;
        this.competition.getLeague().setName(newName);
        this.tournamentRepository.editObject(this.tournament)
            .subscribe(
                /* happy path */(tournamentRes: Tournament) => {
                    this.tournament = tournamentRes;
                    // this.router.navigate(['/admin', newTournamentId]);
                    this.setAlert('success', 'de naam is opgeslagen');
                },
                /* error path */ e => {
                    this.setAlert('danger', 'de naam kon niet worden opgeslagen');
                    this.processing = false;
                },
                /* onComplete */() => { this.processing = false; }
            );
    }

    sendRequestOldStructure() {
        this.route.params.subscribe(params => {
            const tournamentId = +params['id'];
            this.tournamentRepository.sendRequestOldStructure(tournamentId).subscribe(
                 /* happy path */ retVal => {
                    this.processing = false;
                    this.oldStructureRequested = true;
                },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                /* onComplete */() => this.processing = false
            );
        });
    }
}
