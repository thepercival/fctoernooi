import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlanningEditMode, RoundNumber } from 'ngx-sport';

import { AuthService } from '../../lib/auth/auth.service';
import { CSSService } from '../../shared/common/cssservice';
import { Role } from '../../lib/role';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { TranslateFieldService } from '../../lib/translate/field';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
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
import { CopyConfig, CopyModalComponent } from '../../public/tournament/copymodal.component';
import { CopiedModalComponent } from './copiedmodal.component';

@Component({
    selector: 'app-tournament-home-admin',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeAdminComponent extends TournamentComponent implements OnInit {


    lockerRoomValidator!: LockerRoomValidator;
    hasBegun: boolean = true;
    hasPlanningEditManualMode: boolean = false;
    allPoulesHaveGames: boolean = false;
    openModalCopiedCheck: boolean = false;

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
        private translate: TranslateFieldService
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);


    }

    ngOnInit() {
        super.myNgOnInit(() => this.postNgOnInit());
    }

    postNgOnInit() {        
        this.lockerRoomValidator = new LockerRoomValidator(this.tournament.getCompetitors(), this.tournament.getLockerRooms());
        const firstRoundNumber = this.structure.getFirstRoundNumber();
        this.hasBegun = firstRoundNumber.hasBegun();
        this.allPoulesHaveGames = this.structure.allPoulesHaveGames();
        this.hasPlanningEditManualMode = this.structureHasPlanningEditManualMode(firstRoundNumber);
        
        this.route.queryParams.subscribe((params: Params) => {
            if (params.newStartForCopyAsTime !== undefined) {
                this.openModalCopy(params.newStartForCopyAsTime);
            } else if (params.myPreviousId !== undefined && !this.openModalCopiedCheck) {
                this.openModalCopiedCheck = true; 
                this.openModalCopied(params.myPreviousId);                
            }
          });
        this.processing = false;
    }

    private calculateNewStartDate(newStartForCopyAsTime: string | undefined): Date {
        if (newStartForCopyAsTime !== undefined) {
            const newStartDate = new Date(parseInt(newStartForCopyAsTime, 10));
            newStartDate.setDate(newStartDate.getDate() + 1);
            return newStartDate;
        }         
        
        const tournamentDate = this.tournament.getCompetition().getStartDateTime();
        const currentDate = new Date();
        const newStartDate = currentDate.getTime() > tournamentDate.getTime() ? currentDate : tournamentDate;
        newStartDate.setDate(newStartDate.getDate() + 1);
        return newStartDate;
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
        return competitors.some(competitor => competitor.getPresent()) && !competitors.every(competitor => competitor.getPresent());
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
        return this.translate.getFieldNameSingular(sport?.getCustomId());
    }

    getFieldsDescription(): string {
        const sport = this.competition.hasMultipleSports() ? undefined : this.competition.getSingleSport().getSport();
        return this.translate.getFieldNamePlural(sport?.getCustomId());
    }

    getNrOfLockerRoomsDescription(): string {
        const nrOfLockerRooms = this.tournament.getLockerRooms().length;
        let description = 'kleed-<br/>kamer';
        if( nrOfLockerRooms > 0) {
            description = nrOfLockerRooms + ' ' + description;
        }
        return description + (nrOfLockerRooms === 1 ? '' : 's');
    }

    getNrOfRefereesDescription(): string {
        const nrOfReferees = this.competition.getReferees().length;
        let description = 'scheids-<br/>rechter';
        if( nrOfReferees > 0) {
            description = nrOfReferees + ' ' + description;
        }
        return description + (nrOfReferees === 1 ? '' : 's');
    }

    getNrOfSponsorsDescription(): string {
        const nrOfSponsors = this.tournament.getSponsors().length;
        let description = 'sponsor';
        if( nrOfSponsors > 0) {
            description = nrOfSponsors + ' ' + description;
        }
        return description + (nrOfSponsors === 1 ? '' : 's');
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

    getExportSubjectsFromDevice(readonlySubjects: number): number {
        let exportSubjectsItem = localStorage.getItem('exportSubjects');

        const defaultSubjects = TournamentExportConfig.gameNotes + TournamentExportConfig.lockerRooms + TournamentExportConfig.qrCode;
        let exportSubjects: number = exportSubjectsItem !== null ? +exportSubjectsItem : defaultSubjects;

        if ((readonlySubjects & TournamentExportConfig.lockerRooms) && (exportSubjects & TournamentExportConfig.lockerRooms) > 0) {
            exportSubjects -= TournamentExportConfig.lockerRooms;
        }
        if ((readonlySubjects & TournamentExportConfig.qrCode) && (exportSubjects & TournamentExportConfig.qrCode) > 0) {
            exportSubjects -= TournamentExportConfig.qrCode;
        }
        if ((readonlySubjects & TournamentExportConfig.gameNotes) && (exportSubjects & TournamentExportConfig.gameNotes) > 0) {
            exportSubjects -= TournamentExportConfig.gameNotes;
        }
        return exportSubjects;
    }

    getExportReadOnlySubjects(): number {
        let readOnlySubjects = 0;

        if (!this.lockerRoomValidator.areSomeArranged()) {
            readOnlySubjects += TournamentExportConfig.lockerRooms;
        }
        if (!this.tournament.getPublic()) {
            readOnlySubjects += TournamentExportConfig.qrCode;
        }
        if (this.structure.getLastRoundNumber().hasFinished()) {
            readOnlySubjects += TournamentExportConfig.gameNotes;
        }
        return readOnlySubjects;
    }

    openModalExport() {
        const activeModal = this.modalService.open(ExportModalComponent, { backdrop: 'static' });
        activeModal.componentInstance.tournament = this.tournament;
        const readonlySubjects = this.getExportReadOnlySubjects();
        activeModal.componentInstance.subjects = this.getExportSubjectsFromDevice(readonlySubjects);
        activeModal.componentInstance.readonlySubjects = readonlySubjects;
        activeModal.componentInstance.fieldDescription = this.getFieldDescription();
        activeModal.result.then((url: string) => {
        }, (reason) => { });
    }

    openModalCopy(newStartForCopyAsTime?: string) {
        this.processing = true;
        const newStartDate = this.calculateNewStartDate(newStartForCopyAsTime);        
        
        this.userRepository.getLoggedInObject()
            .subscribe({
                next: (loggedInUser: User | undefined) => {
                    if (loggedInUser === undefined) {
                        const navigationExtras: NavigationExtras = {
                            queryParams: { type: IAlertType.Danger, message: 'je bent niet ingelogd' }
                        };
                        this.router.navigate(['', navigationExtras]);
                        return;
                    }
                    const nrOfCredits = loggedInUser.getNrOfCredits();
                    if (loggedInUser.getValidated()  && nrOfCredits === 0) {
                        this.router.navigate(['/user/buycredits']);
                        return;
                    }
                    const activeModal = this.modalService.open(CopyModalComponent, { scrollable: false });
                    activeModal.componentInstance.name = this.tournament.getName();
                    activeModal.componentInstance.startDateTime = newStartDate;
                    activeModal.componentInstance.showLowCreditsWarning = nrOfCredits === 1;

                    activeModal.result.then((result) => {
                        this.copy(result);
                    }, (reason) => {
                    });
                    this.processing = false;
                },
                error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
            });
    }

    openModalCopied(previousId: string) {        
        const activeModal = this.modalService.open(CopiedModalComponent, { scrollable: false });
        activeModal.componentInstance.previousId = previousId;
        activeModal.componentInstance.title = this.tournament.getName(); 

        activeModal.result.then((previousId: string) => {
            this.router.navigate(['/admin', previousId ]);
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
        const publicInitial = this.tournament.getPublic();
        activeModal.componentInstance.publicInitial = publicInitial; 
        activeModal.result.then((publicEnabled: boolean) => {
            const sendToHomeAdmin = publicInitial === false && publicEnabled;
            this.share(publicEnabled, sendToHomeAdmin);
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

    copy(copyConfig: CopyConfig) {
        this.setAlert(IAlertType.Info, 'de nieuwe editie wordt aangemaakt');
        

        this.processing = true;
        this.tournamentRepository.copyObject(this.tournament.getId(), copyConfig)
            .subscribe({
                next: (newTournamentId: number | string) => {
                    const navigationExtras: NavigationExtras = {
                        queryParams: { myPreviousId: this.tournament.getId() }
                    };
                    this.router.navigate(['/admin', newTournamentId], navigationExtras);
                    this.setAlert(IAlertType.Success, 'de nieuwe editie is aangemaakt, je bevindt je nu in de nieuwe editie');
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, 'er kon geen nieuwe editie worden aangemaakt : ' + e);
                    this.processing = false;
                },
                complete: () => this.processing = false
            });
    }

    share(publicEnabled: boolean, sendToHomeEdit: boolean) {
        this.setAlert(IAlertType.Info, 'het delen wordt gewijzigd');

        this.processing = true;
        const json = this.tournamentMapper.toJson(this.tournament);
        json.public = publicEnabled;
        this.tournamentRepository.editObject(json)
            .subscribe({
                next: (tournament: Tournament) => {
                    this.tournament = tournament;
                    if (sendToHomeEdit) {
                        this.router.navigate(['/admin/homeedit', tournament.getId()]);
                    }
                    
                    this.setAlert(IAlertType.Success, 'het delen is gewijzigd');
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, 'het delen kon niet worden gewijzigd');
                    this.processing = false;
                },
                complete: () => this.processing = false
            });
    }
}
