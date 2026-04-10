import { ActivatedRoute, Router } from '@angular/router';
import { Structure, Competition, Category } from 'ngx-sport';

import { IAlert, IAlertType } from '../common/alert';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { GlobalEventsManager } from '../common/eventmanager';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryChooseModalComponent } from './category/chooseModal.component';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { NavBarData } from '../layout/nav/nav.component';
import { DefaultJsonTheme, JsonTheme } from '../../lib/tournament/theme';
import {
    faCalendarAlt,
    faCheckCircle,
    faChevronRight,
    faCogs,
    faCompressAlt,
    faCopy,
    faDoorClosed,
    faEnvelope,
    faExpandAlt,
    faEye,
    faFileExcel,
    faFileLines,
    faGrip,
    faHome,
    faInfoCircle,
    faLevelUpAlt,
    faListOl,
    faListUl,
    faLocationDot,
    faMedal,
    faMinus,
    faMoneyBillAlt,
    faPencil,
    faPencilAlt,
    faPlus,
    faPlusCircle,
    faPrint,
    faRandom,
    faRegistered,
    faSave,
    faShareAlt,
    faSort,
    faSpinner,
    faStar,
    faSync,
    faTimesCircle,
    faTrashAlt,
    faTv,
    faUserFriends,
    faUserPlus,
    faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { inject, signal, WritableSignal } from '@angular/core';

export class TournamentComponent {

    public readonly faCalendarAlt = faCalendarAlt;
    public readonly faCheckCircle = faCheckCircle;
    public readonly faChevronRight = faChevronRight;
    public readonly faCogs = faCogs;
    public readonly faCompressAlt = faCompressAlt;
    public readonly faCopy = faCopy;
    public readonly faDoorClosed = faDoorClosed;
    public readonly faEnvelope = faEnvelope;
    public readonly faExpandAlt = faExpandAlt;
    public readonly faEye = faEye;
    public readonly faFileExcel = faFileExcel;
    public readonly faFileLines = faFileLines;
    public readonly faGrip = faGrip;
    public readonly faHome = faHome;
    public readonly faInfoCircle = faInfoCircle;
    public readonly faLevelUpAlt = faLevelUpAlt;
    public readonly faListOl = faListOl;
    public readonly faListUl = faListUl;
    public readonly faLocationDot = faLocationDot;
    public readonly faMedal = faMedal;
    public readonly faMinus = faMinus;
    public readonly faMoneyBillAlt = faMoneyBillAlt;
    public readonly faPencil = faPencil;
    public readonly faPencilAlt = faPencilAlt;
    public readonly faPlus = faPlus;
    public readonly faPlusCircle = faPlusCircle;
    public readonly faPrint = faPrint;
    public readonly faRandom = faRandom;
    public readonly faRegistered = faRegistered;
    public readonly faSave = faSave;
    public readonly faShareAlt = faShareAlt;
    public readonly faSort = faSort;
    public readonly faSpinner = faSpinner;
    public readonly faStar = faStar;
    public readonly faSync = faSync;
    public readonly faTimesCircle = faTimesCircle;
    public readonly faTrashAlt = faTrashAlt;
    public readonly faTv = faTv;
    public readonly faUserFriends = faUserFriends;
    public readonly faUserPlus = faUserPlus;
    public readonly faUsers = faUsers;

    public tournament!: Tournament;
    public competition!: Competition;
    public structure!: Structure;
    
    public readonly alert: WritableSignal<IAlert | undefined> = signal(undefined);
    public readonly processing: WritableSignal<boolean> = signal(true);
    public readonly favoriteCategories: WritableSignal<Category[]> = signal([]);

    protected modalService: NgbModal = inject(NgbModal);
    protected favRepository: FavoritesRepository = inject(FavoritesRepository);

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected tournamentRepository: TournamentRepository,
        protected structureRepository: StructureRepository,
        protected globalEventsManager: GlobalEventsManager
    ) {
    }

    myNgOnInit(callback?: DataProcessCallBack, noStructure?: boolean) {
        this.route.params.subscribe(params => {
            this.setData(+params['id'], callback, noStructure);
        });
    }

    setData(tournamentId: number | string, callback?: DataProcessCallBack, noStructure?: boolean) {
        this.tournamentRepository.getObject(tournamentId)
            .subscribe({
                next: (tournament: Tournament) => {
                    this.tournament = tournament;
                    this.competition = tournament.getCompetition();
                    if (noStructure === true) {
                        if (callback !== undefined) {
                            callback();
                        }
                        this.globalEventsManager.updateDataInNavBar.emit(this.getNavBarData(tournament));
                        this.globalEventsManager.showFooter.emit(false);
                        return;
                    }
                    this.structureRepository.getObject(tournament)
                        .subscribe({
                            next: (structure: Structure) => {
                                this.structure = structure;
                                // console.log(structure);
                                if (callback !== undefined) {
                                    callback();
                                }
                            },
                            error: (e) => {
                                this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
                            }
                        });
                    this.globalEventsManager.updateDataInNavBar.emit(this.getNavBarData(tournament));
                    this.globalEventsManager.showFooter.emit(false);
                },
                error: (e) => {
                    this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
                }
            });
    }

    private getNavBarData(tournament: Tournament): NavBarData {
        return {
            title: tournament.getName(),
            atHome: false,
            theme: tournament?.getTheme() ?? DefaultJsonTheme
        };
    }

    public getTheme(tournament: Tournament): JsonTheme {
        return tournament.getTheme() ?? DefaultJsonTheme;
    }

    hasRole(authService: AuthService, roles: number): boolean {
        const loggedInUserId = authService.getLoggedInUserId();
        const tournamentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
        return tournamentUser ? tournamentUser.hasARole(roles) : false;
    }

    getCategoryFavoritesActiveClass(structure: Structure): string {
        return structure.getCategories().length !== this.favoriteCategories.length ? 'primary' : 'secondary';
    }

    isCategoryFilterActive(structure: Structure): boolean {
        return structure.getCategories().length !== this.favoriteCategories.length;
        // return this.favorites.hasCategories() && this.favoriteCategories.length > 0
    }

    updateFavoriteCategories(structure: Structure) {
        const favorites = this.favRepository.getObject(this.tournament, structure.getCategories());
        this.favoriteCategories.set(favorites.filterCategories(structure.getCategories()));
    }

    openCategoriesChooseModal(structure: Structure) {
        const activeModal = this.modalService.open(CategoryChooseModalComponent);
        activeModal.componentInstance.categories = structure.getCategories();
        activeModal.componentInstance.tournament = this.tournament;
        activeModal.result.then(() => {
        }, () => {
            this.updateFavoriteCategories(structure);
        });
    }

    getLogoUrl(tournament: Tournament, width: 20 | 200): string {
        return this.tournamentRepository.getLogoUrl(tournament, width);
    }
}

type DataProcessCallBack = () => void;
