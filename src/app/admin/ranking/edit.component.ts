import { Component, OnInit, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
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

@Component({
    selector: 'app-tournament-ranking-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [EscapeHtmlPipe,NgbAlert,RankingCategoryComponent,FontAwesomeModule,RankingRulesComponent,TournamentNavBarComponent]
})
export class RankingEditComponent extends TournamentComponent implements OnInit {
    faSpinner = faSpinner;
    public favorites!: Favorites;
    public structureNameService!: StructureNameService;
    public againstRuleSet!: AgainstRuleSet;
    public hasBegun: boolean = true;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        protected tournamentMapper: TournamentMapper,
        protected authService: AuthService
    ) {
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
        return this.hasRole(this.authService, Role.Admin);
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
        const activeModal = this.modalService.open(CategoryChooseModalComponent);
        activeModal.componentInstance.categories = structure.getCategories();
        activeModal.componentInstance.tournament = this.tournament;
        activeModal.result.then((result) => {
        }, (reason) => {
            this.updateFavoriteCategories(structure);
        });
    }
}
