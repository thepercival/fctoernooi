import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameMode, League, RankingRuleSet, RoundNumber } from 'ngx-sport';

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
import { RankingRuleSetModalComponent } from './rankingrulesetmodal.component';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { DateFormatter } from '../../lib/dateFormatter';

@Component({
    selector: 'app-tournament-admin',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent extends TournamentComponent implements OnInit {
    copyForm: FormGroup;
    minDateStruct: NgbDateStruct;
    translate: TranslateService;
    lockerRoomValidator!: LockerRoomValidator;

    constructor(
        route: ActivatedRoute,
        private competitionSportRouter: CompetitionSportRouter,
        private modalService: NgbModal,
        public cssService: CSSService,
        router: Router,
        private tournamentMapper: TournamentMapper,
        private authService: AuthService,
        public dateFormatter: DateFormatter,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
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
    }

    ngOnInit() {
        super.myNgOnInit(() => this.postNgOnInit());
    }

    postNgOnInit() {
        this.lockerRoomValidator = new LockerRoomValidator(this.tournament.getCompetitors(), this.tournament.getLockerRooms());
        const date = new Date();
        this.copyForm.controls.date.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
        this.processing = false;
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
        return nrOfSponsors + ' sponsors' + (nrOfSponsors === 1 ? '' : 's');
    }

    getLockerRoomBorderClass(): string {
        const arrangedIncompleet = !this.lockerRoomValidator.areAllArranged() && this.lockerRoomValidator.areSomeArranged();
        return arrangedIncompleet ? 'border-warning' : '';
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

    openModalExport() {
        const activeModal = this.modalService.open(ExportModalComponent);
        let enabled = TournamentExportConfig.gameNotes;
        if (this.lockerRoomValidator.areSomeArranged()) {
            enabled += TournamentExportConfig.lockerRooms;
        }
        if (this.tournament.getPublic()) {
            enabled += TournamentExportConfig.qrCode;
        }
        activeModal.componentInstance.enabled = enabled;
        activeModal.componentInstance.fieldDescription = this.getFieldDescription();
        activeModal.result.then((exportAction: TournamentExportAction) => {
            this.processing = true;
            this.tournamentRepository.getExportUrl(this.tournament, exportAction)
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

    openModalRankingRuleSet() {
        const activeModal = this.modalService.open(RankingRuleSetModalComponent);
        activeModal.componentInstance.rankingRuleSet = this.tournament.getCompetition().getRankingRuleSet();
        activeModal.result.then((rankingRuleSet: RankingRuleSet) => {
            this.processing = true;
            const json = this.tournamentMapper.toJson(this.tournament);
            json.competition.rankingRuleSet = rankingRuleSet;
            this.tournamentRepository.editObject(json)
                .subscribe(
                /* happy path */(tournament: Tournament) => { this.tournament = tournament; },
                /* error path */ e => { this.alert = { type: 'danger', message: e }; this.processing = false; },
                /* onComplete */() => { this.processing = false; }
                );
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

    hasGameModeAgainst(): boolean {
        const hasGameModeAgainst = (roundNumber: RoundNumber): boolean => {
            if (roundNumber.getValidPlanningConfig().getGameMode() === GameMode.Against) {
                return true;
            }
            const nextRoundNumber = roundNumber.getNext();
            return nextRoundNumber ? hasGameModeAgainst(nextRoundNumber) : false;
        };
        return hasGameModeAgainst(this.structure.getFirstRoundNumber());
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
                /* happy path */(newTournamentId: number | string) => {
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

    share(publicEnabled: boolean) {
        this.setAlert('info', 'het delen wordt gewijzigd');

        this.processing = true;
        const json = this.tournamentMapper.toJson(this.tournament);
        json.public = publicEnabled;
        this.tournamentRepository.editObject(json)
            .subscribe(
                /* happy path */(tournament: Tournament) => {
                    this.tournament = tournament;
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
        const json = this.tournamentMapper.toJson(this.tournament);
        json.competition.league.name = newName;
        this.tournamentRepository.editObject(json)
            .subscribe(
                /* happy path */(tournament: Tournament) => {
                    this.tournament = tournament;
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
}
