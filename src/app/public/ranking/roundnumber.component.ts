import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { RoundNumber, Poule, State, NameService } from 'ngx-sport';
import { Tournament } from '../../lib/tournament';

@Component({
    selector: 'app-tournament-ranking-roundnumber',
    templateUrl: './roundnumber.component.html',
    styleUrls: ['./roundnumber.component.scss']
})
export class RankingRoundNumberComponent implements OnInit {
    @Input() tournament: Tournament;
    @Input() roundNumber: RoundNumber;
    @Input() notopborder: boolean;
    show: boolean;

    constructor(
        public nameService: NameService
    ) {
    }

    ngOnInit() {
        const state = this.roundNumber.getState();
        const stateNext = this.roundNumber.hasNext() ? this.roundNumber.getNext().getState() : undefined;
        this.show = false;
        if (state === State.InProgress) {
            this.show = true;
        } else if ((state === State.Created || state === State.Finished) && (stateNext === undefined || stateNext === State.Created)) {
            this.show = true;
        }

    }

    getPoules(): Poule[] {
        return this.roundNumber.getPoules().filter(poule => poule.needsRanking());
    }
}
