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

export class TournamentComponent {

    public tournament!: Tournament;
    public competition!: Competition;
    public structure!: Structure;
    public alert: IAlert | undefined;
    public processing = true;
    public favoriteCategories!: Category[];

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected tournamentRepository: TournamentRepository,
        protected structureRepository: StructureRepository,
        protected globalEventsManager: GlobalEventsManager,
        protected modalService: NgbModal,
        protected favRepository: FavoritesRepository
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
                                console.log(e);
                                this.setAlert(IAlertType.Danger, e); this.processing = false;
                            }
                        });
                    this.globalEventsManager.updateDataInNavBar.emit(this.getNavBarData(tournament));
                    this.globalEventsManager.showFooter.emit(false);
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, e); this.processing = false;
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

    public setAlert(type: IAlertType, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    protected resetAlert(): void {
        this.alert = undefined;
    }

    hasRole(authService: AuthService, roles: number): boolean {
        const loggedInUserId = authService.getLoggedInUserId();
        const tournamentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
        return tournamentUser ? tournamentUser.hasARole(roles) : false;
    }

    openCategoriesChooseModal(structure: Structure) {
        const activeModal = this.modalService.open(CategoryChooseModalComponent);
        activeModal.componentInstance.categories = structure.getCategories();
        activeModal.componentInstance.tournament = this.tournament;
        activeModal.result.then((result) => {
        }, (reason) => {
            this.updateFavoriteCategories(structure);
        });
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
        this.favoriteCategories = favorites.filterCategories(structure.getCategories());
    }

    getLogoUrl(tournament: Tournament, width: 20 | 200): string {
        return this.tournamentRepository.getLogoUrl(tournament, width);
    }
}

type DataProcessCallBack = () => void;
