import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { League, PlanningEditMode, RoundNumber } from 'ngx-sport';

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
import { CompetitionSportRouter } from '../../shared/tournament/competitionSport.router';
import { ExportModalComponent, TournamentExportAction } from './exportmodal.component';
import { ShareModalComponent } from './sharemodal.component';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { DateFormatter } from '../../lib/dateFormatter';
import { IAlertType } from '../../shared/common/alert';

@Component({
    selector: 'app-tournament-admin',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent extends TournamentComponent implements OnInit {
    copyForm: FormGroup;
    minDateStruct: NgbDateStruct;
    lockerRoomValidator!: LockerRoomValidator;
    hasBegun: boolean = true;
    hasPlanningEditManualMode: boolean = false;
    allPoulesHaveGames: boolean = false;

    constructor(
        route: ActivatedRoute,
        private competitionSportRouter: CompetitionSportRouter,
        private modalService: NgbModal,
        public cssService: CSSService,
        router: Router,
        private tournamentMapper: TournamentMapper,
        private authService: AuthService,
        public dateFormatter: DateFormatter,
        private translate: TranslateService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        const date = new Date();
        this.minDateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };

        this.copyForm = fb.group({
            date: ['', Validators.compose([
            ])]
        });
    }

    ngOnInit() {
        super.myNgOnInit(() => this.postNgOnInit());
    }

    postNgOnInit() {
        this.lockerRoomValidator = new LockerRoomValidator(this.tournament.getCompetitors(), this.tournament.getLockerRooms());
        const date = new Date();
        const firstRoundNumber = this.structure.getFirstRoundNumber();
        this.hasBegun = firstRoundNumber.hasBegun();
        this.allPoulesHaveGames = this.structure.allPoulesHaveGames();
        this.hasPlanningEditManualMode = this.structureHasPlanningEditManualMode(firstRoundNumber);
        this.copyForm.controls.date.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
        this.processing = false;
    }

    protected structureHasPlanningEditManualMode(roundNumber: RoundNumber): boolean {
        if (roundNumber.getValidPlanningConfig().getEditMode() === PlanningEditMode.Manual) {
            return true
        }
        const nextRoundNumber = roundNumber.getNext();
        return nextRoundNumber !== undefined && this.structureHasPlanningEditManualMode(nextRoundNumber);
    }

    protected allArranged(): boolean {
        return this.tournament.getCompetitors().every(competitor => {
            return this.tournament.getLockerRooms().some(lockerRoom => {
                return lockerRoom.hasCompetitor(competitor);
            });
        });
    }

    getNrOfCompetitors(): number {
        return this.tournament.getCompetitors().length;
    }

    getNrOfPlaces(): number {
        return this.structure.getFirstRoundNumber().getNrOfPlaces();
    }

    allPlacesAssigned(): boolean {
        return this.getNrOfCompetitors() === this.getNrOfPlaces();
    }

    someCompetitorsRegistered(): boolean {
        const competitors = this.tournament.getCompetitors();
        return competitors.some(competitor => competitor.getRegistered()) && !competitors.every(competitor => competitor.getRegistered());
    }

    getFieldDescription(): string {
        const sport = this.competition.hasMultipleSports() ? undefined : this.competition.getSports()[0].getSport();
        return this.translate.getFieldNameSingular(sport);
    }

    getFieldsDescription(): string {
        const sport = this.competition.hasMultipleSports() ? undefined : this.competition.getSports()[0].getSport();
        return this.translate.getFieldNamePlural(sport);
    }

    getNrOfFieldsDescription() {
        const nrOfFields = this.competition.getFields().length;
        if (nrOfFields < 2) {
            return nrOfFields + ' ' + this.getFieldDescription();
        }
        return nrOfFields + ' ' + this.getFieldsDescription();
    }

    getNrOfLockerRoomsDescription(): string {
        const nrOfLockerRooms = this.tournament.getLockerRooms().length;
        return nrOfLockerRooms + ' kleed-<br/>kamer' + (nrOfLockerRooms === 1 ? '' : 's');
    }

    getNrOfRefereesDescription(): string {
        const nrOfReferees = this.competition.getReferees().length;
        return nrOfReferees + ' scheids-<br/>rechter' + (nrOfReferees === 1 ? '' : 's');
    }

    getNrOfSponsorsDescription(): string {
        const nrOfSponsors = this.tournament.getSponsors().length;
        return nrOfSponsors + ' sponsor' + (nrOfSponsors === 1 ? '' : 's');
    }

    getPlanningBorderClass(): string {
        if (!this.allPoulesHaveGames) {
            return 'border-danger';
        }
        else if (this.hasPlanningEditManualMode) {
            return 'border-warning';
        }
        return 'border-secondary';
    }

    getLockerRoomBorderClass(): string {
        const arrangedIncompleet = !this.lockerRoomValidator.areAllArranged() && this.lockerRoomValidator.areSomeArranged();
        return arrangedIncompleet ? 'border-warning' : '';
    }

    getLiveBoardBorderClass(): string {
        return this.hasBegun ? 'border-success' : '';
    }

    isAdmin(): boolean {
        return this.hasRole(this.authService, Role.ADMIN);
    }

    isRoleAdmin(): boolean {
        return this.hasRole(this.authService, Role.ROLEADMIN);
    }

    isRefereeOrGameResultAdmin(): boolean {
        return this.hasRole(this.authService, Role.GAMERESULTADMIN + Role.REFEREE);
    }

    remove() {
        this.setAlert(IAlertType.Info, 'het toernooi wordt verwijderd');
        this.processing = true;
        this.tournamentRepository.removeObject(this.tournament)
            .subscribe({
                next: (deleted: boolean) => {
                    if (deleted) {
                        const navigationExtras: NavigationExtras = {
                            queryParams: { type: IAlertType.Success, message: 'het toernooi is verwijderd' }
                        };
                        this.router.navigate(['/'], navigationExtras);
                    } else {
                        this.setAlert(IAlertType.Danger, 'het toernooi kon niet verwijderd worden');
                        this.processing = false;
                    }
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, 'het toernooi kon niet verwijderd worden');
                    this.processing = false;
                },
                complete: () => this.processing = false
            });
    }

    getExportSubjectsFromDevice(): number {
        let exportSubjectsItem = localStorage.getItem('exportSubjects');

        const defaultSubjects = TournamentExportConfig.gameNotes + TournamentExportConfig.lockerRooms + TournamentExportConfig.qrCode;
        let exportSubjects: number = exportSubjectsItem !== null ? +exportSubjectsItem : defaultSubjects;

        if (!this.lockerRoomValidator.areSomeArranged() && (exportSubjects & TournamentExportConfig.lockerRooms) > 0) {
            exportSubjects -= TournamentExportConfig.lockerRooms;
        }
        if (!this.tournament.getPublic() && (exportSubjects & TournamentExportConfig.qrCode) > 0) {
            exportSubjects -= TournamentExportConfig.qrCode;
        }
        return exportSubjects;
    }

    setExportSubjectsOnDevice(exportSubjects: number) {
        localStorage.setItem('exportSubjects', JSON.stringify(exportSubjects));
    }

    openModalExport() {
        const activeModal = this.modalService.open(ExportModalComponent);
        activeModal.componentInstance.subjects = this.getExportSubjectsFromDevice();
        activeModal.componentInstance.fieldDescription = this.getFieldDescription();
        activeModal.result.then((exportAction: TournamentExportAction) => {
            this.setExportSubjectsOnDevice(exportAction.subjects);
            this.processing = true;
            this.tournamentRepository.getExportUrl(this.tournament, exportAction)
                .subscribe({
                    next: (url: string) => {
                        window.open(url);
                    },
                    error: (e) => {
                        this.setAlert(IAlertType.Danger, 'het exporteren is niet gelukt');
                        this.processing = false;
                    },
                    complete: () => this.processing = false
                });
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

    openModalCopy(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(modalContent, { scrollable: false });
        activeModal.result.then((result) => {
            if (result === 'copy') {
                this.copy();
            }
        }, (reason) => {
        });
    }

    openModalRemove(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(modalContent);
        activeModal.result.then((result) => {
            if (result === 'remove') {
                this.remove();
            }
        }, (reason) => {
        });
    }

    openModalShare() {
        const activeModal = this.modalService.open(ShareModalComponent);
        activeModal.componentInstance.tournament = this.tournament;
        activeModal.result.then((publicEnabled: boolean) => {
            this.share(publicEnabled);
        }, (reason) => {
        });
    }

    openGuide() {

    }

    linkToStructure() {
        this.router.navigate(['/admin/structure', this.tournament.getId()]);
    }

    linkToCompetitionSport() {
        this.competitionSportRouter.navigate(this.tournament);
    }

    getCurrentYear() {
        const date = new Date();
        return date.getFullYear();
    }

    copy() {
        this.setAlert(IAlertType.Info, 'de nieuwe editie wordt aangemaakt');
        const startDateTime = new Date(
            this.copyForm.controls.date.value.year,
            this.copyForm.controls.date.value.month - 1,
            this.copyForm.controls.date.value.day,
            this.competition.getStartDateTime().getHours(),
            this.competition.getStartDateTime().getMinutes(),
        );

        this.processing = true;
        this.tournamentRepository.copyObject(this.tournament, startDateTime)
            .subscribe({
                next: (newTournamentId: number | string) => {
                    this.router.navigate(['/admin', newTournamentId]);
                    this.setAlert(IAlertType.Success, 'de nieuwe editie is aangemaakt, je bevindt je nu in de nieuwe editie');
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, 'er kon geen nieuwe editie worden aangemaakt : ' + e);
                    this.processing = false;
                },
                complete: () => this.processing = false
            });
    }

    share(publicEnabled: boolean) {
        this.setAlert(IAlertType.Info, 'het delen wordt gewijzigd');

        this.processing = true;
        const json = this.tournamentMapper.toJson(this.tournament);
        json.public = publicEnabled;
        this.tournamentRepository.editObject(json)
            .subscribe({
                next: (tournament: Tournament) => {
                    this.tournament = tournament;
                    // this.router.navigate(['/admin', newTournamentId]);
                    this.setAlert(IAlertType.Success, 'het delen is gewijzigd');
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, 'het delen kon niet worden gewijzigd');
                    this.processing = false;
                },
                complete: () => this.processing = false
            });
    }

    saveName(newName: string) {
        this.setAlert(IAlertType.Info, 'de naam wordt opgeslagen');

        this.processing = true;
        const json = this.tournamentMapper.toJson(this.tournament);
        json.competition.league.name = newName;
        this.tournamentRepository.editObject(json)
            .subscribe({
                next: (tournament: Tournament) => {
                    this.tournament = tournament;
                    // this.router.navigate(['/admin', newTournamentId]);
                    this.setAlert(IAlertType.Success, 'de naam is opgeslagen');
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, 'de naam kon niet worden opgeslagen');
                    this.processing = false;
                },
                complete: () => this.processing = false
            });
    }
}
