import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { AgainstRuleSet, Category, GameState, StartLocationMap, Structure, StructureNameService } from 'ngx-sport';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { Role } from '../../lib/role';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { Tournament } from '../../lib/tournament';
import { Favorites } from '../../lib/favorites';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-tournament-ranking-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss']
})
export class RankingEditComponent extends TournamentComponent implements OnInit {
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
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        protected tournamentMapper: TournamentMapper,
        protected authService: AuthService
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            this.updateFavoriteCategories(this.structure);
            this.againstRuleSet = this.tournament.getCompetition().getAgainstRuleSet();
            const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
            this.structureNameService = new StructureNameService(startLocationMap);
            this.favorites = this.favRepository.getObject(this.tournament, this.structure.getCategories());
            this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
            this.processing = false;
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
        this.resetAlert();
        this.processing = true;
        const json = this.tournamentMapper.toJson(this.tournament);
        json.competition.againstRuleSet = againstRuleSet;
        this.tournamentRepository.editObject(json)
            .subscribe({
                next: (tournament: Tournament) => { this.tournament = tournament; },
                error: (e) => {
                    this.alert = { type: IAlertType.Danger, message: e }; this.processing = false;
                },
                complete: () => this.processing = false
            });
    }
}
