import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { State, Competitor } from 'ngx-sport';
import { FavoritesRepository } from '../../lib/favorites/repository';

@Component({
    selector: 'app-tournament-ranking',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class RankingComponent extends TournamentComponent implements OnInit {
    activeTab: number;
    competitors: Competitor[];

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        protected favRepository: FavoritesRepository
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => {
            const competitors = this.structure.getFirstRoundNumber().getCompetitors();
            this.competitors = this.favRepository.getItem(this.tournament).filterCompetitors(competitors);

            this.activeTab = 1;
            if (this.structure.getLastRoundNumber().getState() === State.Finished) {
                this.activeTab = 2;
            }
            this.processing = false;
        });
    }
}
