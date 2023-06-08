import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    AgainstVariant,
    CompetitionSport,
    Sport,
} from 'ngx-sport';
import { CSSService } from '../../shared/common/cssservice';
import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { TranslateFieldService } from '../../lib/translate/field';
import { CompetitionSportTab } from '../../shared/tournament/competitionSportTab';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FavoritesRepository } from '../../lib/favorites/repository';

@Component({
    selector: 'app-tournament-sportconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class CompetitionSportEditComponent extends TournamentComponent implements OnInit {
    competitionSport: CompetitionSport | undefined;
    activeTab!: number;
    hasBegun!: boolean;
    // startRoundNumber: RoundNumber;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        public cssService: CSSService,
        private translate: TranslateFieldService,
        private myNavigation: MyNavigation
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params.competitionSportId !== undefined) {
                this.activeTab = +params.tabId;
                super.myNgOnInit(() => this.postInit(+params.competitionSportId), false);
            }
        });
    }

    private postInit(id: number) {
        this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
        const competitionSport = this.getCompetitionSportById(id);
        if (competitionSport === undefined) {
            this.router.navigate(['/admin', this.tournament.getId()]);
            return;
        }
        this.competitionSport = competitionSport;
        this.processing = false;
    }

    getSports(): Sport[] {
        return this.tournament.getCompetition().getSports().map(sport => sport.getSport());
    }

    private getCompetitionSportById(id: string | number): CompetitionSport | undefined {
        if (id === 0) {
            return undefined;
        }
        return this.competition.getSports().find(competitionSport => id === competitionSport.getId());
    }

    get TabFields(): number { return CompetitionSportTab.Fields; }
    get TabScore(): number { return CompetitionSportTab.Score; }
    get TabPoints(): number { return CompetitionSportTab.Points; }

    showAgainstQualifyConfig(competitionSport: CompetitionSport): boolean {
        return competitionSport.getVariant() instanceof AgainstVariant;
    }

    navigateBack() {
        this.myNavigation.back();
    }

    linkTo() {
        if (!this.competition.hasMultipleSports()) {
            this.router.navigate(['/admin/competitionsport'
                , this.tournament.getId(), this.competition.getSports()[0].getId()]);
        } else {
            this.router.navigate(['/admin/competitionsport', this.tournament.getId()]);
        }
    }

    linkToSports() {
        this.router.navigate(['/admin/competitionsports', this.tournament.getId()]);
    }

    getFieldsDescription(): string {
        return this.translate.getFieldNamePlural(this.competitionSport?.getSport()?.getCustomId());
    }
}
