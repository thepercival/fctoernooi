import { Component, OnInit, TemplateRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { AgainstRuleSet, Category, GameState, StartLocationMap, Structure, StructureNameService } from 'ngx-sport';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { Tournament } from '../../lib/tournament';
import { Favorites } from '../../lib/favorites';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryChooseModalComponent } from '../../shared/tournament/category/chooseModal.component';
import { RankingCategoryComponent } from '../../shared/tournament/ranking/category.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RankingRulesComponent } from '../../shared/tournament/rankingrules/rankingrules.component';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { EscapeHtmlPipe } from '../../shared/common/escapehtmlpipe';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { CATEGORY_CHOOSE_MODAL_INPUTS } from '../../shared/modal-input-interfaces/category-choose-modal-inputs.interface';
import { createModalInjector } from '../../shared/modal-input-interfaces/create-modal-injector';

@Component({
    selector: 'app-tournament-ranking-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [EscapeHtmlPipe,NgbAlert,RankingCategoryComponent,FontAwesomeModule,RankingRulesComponent,TournamentNavBarComponent]
})
export class RankingEditComponent extends TournamentComponent implements OnInit {
    protected tournamentMapper = inject(TournamentMapper);
    protected authService = inject(AuthService);

    faSpinner = faSpinner;
    public favorites!: Favorites;
    public structureNameService!: StructureNameService;
    public againstRuleSet!: AgainstRuleSet;
    public hasBegun: boolean = true;
    constructor() {
        const route = inject(ActivatedRoute);
        const router = inject(Router);
        const tournamentRepository = inject(TournamentRepository);
        const structureRepository = inject(StructureRepository);
        const globalEventsManager = inject(GlobalEventsManager);

        super(route, router, tournamentRepository, structureRepository, globalEventsManager);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.updateFavoriteCategories(this.structure);
            this.againstRuleSet = this.tournament.getCompetition().getAgainstRuleSet();
            const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
            this.structureNameService = new StructureNameService(startLocationMap);
            this.favorites = this.favRepository.getObject(this.tournament, this.structure.getCategories());
            this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
            this.processing.set(false);
        });
    }

    get RankingScreen(): TournamentScreen { return TournamentScreen.Ranking }

    isAdmin(): boolean {
        return this.authService.loggedInUserHasRole(this.tournament, Role.Admin);
    }

    getRankingRuleSetClass(): string {
        return this.hasBegun ? 'outline-info' : 'primary';
    }

    openRankingRuleSetModal(modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(modalContent);
        activeModal.result.then((againstRuleSet: AgainstRuleSet) => {
        }, (reason) => {
        });
    }

    getRankingRuleSuffix(): string {
        return this.tournament.getCompetition().hasMultipleSports() ? '<small>per sport</small>' : '';
    }

    saveRankingRuleSet(againstRuleSet: AgainstRuleSet) {
        this.alert.set(undefined);
        this.processing.set(true);
        const json = this.tournamentMapper.toJson(this.tournament);
        json.competition.againstRuleSet = againstRuleSet;
        this.tournamentRepository.editObject(json)
            .subscribe({
                next: (tournament: Tournament) => { this.tournament = tournament; },
                error: (e) => {
                    this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
                },
                complete: () => this.processing.set(false)
            });
    }

    openCategoriesChooseModal(structure: Structure) {
        const modalInjector = createModalInjector(this.injector, CATEGORY_CHOOSE_MODAL_INPUTS, {
            categories: structure.getCategories(),
            tournament: this.tournament
        });
        const activeModal = this.modalService.open(CategoryChooseModalComponent, { injector: modalInjector });
        activeModal.result.then((result) => {
        }, (reason) => {
            this.updateFavoriteCategories(structure);
        });
    }
}
