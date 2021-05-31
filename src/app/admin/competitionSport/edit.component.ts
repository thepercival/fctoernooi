import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    AgainstSportVariant,
    CompetitionSport,
    CompetitionSportService,
    RoundNumber,
    Sport,
} from 'ngx-sport';
import { CSSService } from '../../shared/common/cssservice';
import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { TranslateService } from '../../lib/translate';
import { CompetitionSportTab } from '../../shared/tournament/competitionSportTab';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
        public cssService: CSSService,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private translate: TranslateService,
        public competitionSportService: CompetitionSportService,
        private myNavigation: MyNavigation
    ) {
        super(route, router, tournamentRepository, structureRepository);
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
        this.hasBegun = this.structure.getRootRound().hasBegun();
        const competitionSport = this.getCompetitionSportById(id);
        if (competitionSport === undefined) {
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
        return competitionSport.getVariant() instanceof AgainstSportVariant;
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
        return this.translate.getFieldNamePlural(this.competitionSport?.getSport());
    }
}


