import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { League, PlanningEditMode, RoundNumber } from 'ngx-sport';

import { AuthService } from '../../lib/auth/auth.service';
import { CSSService } from '../../shared/common/cssservice';
import { Role } from '../../lib/role';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { TranslateService } from '../../lib/translate';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { NameModalComponent } from '../../shared/tournament/namemodal/namemodal.component';
import { LockerRoomValidator } from '../../lib/lockerroom/validator';
import { CompetitionSportRouter } from '../../shared/tournament/competitionSport.router';
import { ExportModalComponent } from './exportmodal.component';
import { ShareModalComponent } from './sharemodal.component';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { DateFormatter } from '../../lib/dateFormatter';
import { IAlertType } from '../../shared/common/alert';
import { UserRepository } from '../../lib/user/repository';
import { User } from '../../lib/user';
import { TournamentExportConfig } from '../../lib/pdf/repository';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentScreen } from '../../shared/tournament/screenNames';

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
    public nrOfCredits: number | undefined;
    hasPlanningEditManualMode: boolean = false;
    allPoulesHaveGames: boolean = false;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private competitionSportRouter: CompetitionSportRouter,
        public cssService: CSSService,
        private userRepository: UserRepository,
        private tournamentMapper: TournamentMapper,
        private authService: AuthService,
        public dateFormatter: DateFormatter,
        private translate: TranslateService,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
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

    get SettingsScreen(): TournamentScreen { return TournamentScreen.Settings }

    getNrOfCompetitors(): number {
        return this.tournament.getCompetitors().length;
    }

    getNrOfPlaces(): number {
        return this.structure.getRootRounds().reduce((sum, rootRound) => sum + rootRound.getNrOfPlaces(), 0);
    }

    allPlacesAssigned(): boolean {
        return this.getNrOfCompetitors() === this.getNrOfPlaces();
    }

    someCompetitorsRegistered(): boolean {
        const competitors = this.tournament.getCompetitors();
        return competitors.some(competitor => competitor.getRegistered()) && !competitors.every(competitor => competitor.getRegistered());
    }

    getNrOfFieldsDescription() {
        const nrOfFields = this.competition.getFields().length;
        if (nrOfFields < 2) {
            return nrOfFields + ' ' + this.getFieldDescription();
        }
        return nrOfFields + ' ' + this.getFieldsDescription();
    }

    getFieldDescription(): string {
        const sport = this.competition.hasMultipleSports() ? undefined : this.competition.getSingleSport().getSport();
        return this.translate.getFieldNameSingular(sport);
    }

    getFieldsDescription(): string {
        const sport = this.competition.hasMultipleSports() ? undefined : this.competition.getSingleSport().getSport();
        return this.translate.getFieldNamePlural(sport);
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
        return this.hasRole(this.authService, Role.Admin);
    }

    isRoleAdmin(): boolean {
        return this.hasRole(this.authService, Role.RoleAdmin);
    }

    isRefereeOrGameResultAdmin(): boolean {
        return this.hasRole(this.authService, Role.GameResultAdmin + Role.Referee);
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

    openModalExport() {
        const activeModal = this.modalService.open(ExportModalComponent, { backdrop: 'static' });
        activeModal.componentInstance.tournament = this.tournament;
        activeModal.componentInstance.subjects = this.getExportSubjectsFromDevice();
        activeModal.componentInstance.fieldDescription = this.getFieldDescription();
        activeModal.result.then((url: string) => {
        }, (reason) => { });
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

        if (this.nrOfCredits === undefined) {
            this.userRepository.getLoggedInObject()
                .subscribe({
                    next: (loggedInUser: User | undefined) => {
                        if (loggedInUser === undefined) {
                            const navigationExtras: NavigationExtras = {
                                queryParams: { type: IAlertType.Danger, message: 'je bet niet ingelogd' }
                            };
                            this.router.navigate(['', navigationExtras]);
                            return
                        }
                        if (loggedInUser.getValidated()) {
                            this.nrOfCredits = loggedInUser.getNrOfCredits();
                            if (this.nrOfCredits === 0) {
                                this.router.navigate(['/user/buycredits']);
                                return;
                            }
                        }
                        this.processing = false;
                    },
                    error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
                });
        }

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
