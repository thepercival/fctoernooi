import { Component, OnInit, Input, TemplateRef } from '@angular/core';

import { RoundNumber, Poule, State, NameService } from 'ngx-sport';
import { Tournament } from '../../lib/tournament';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-tournament-ranking-roundnumber',
    templateUrl: './roundnumber.component.html',
    styleUrls: ['./roundnumber.component.scss']
})
export class RankingRoundNumberComponent implements OnInit {
    @Input() tournament!: Tournament;
    @Input() roundNumber!: RoundNumber;
    public nameService!: NameService;
    public show: boolean = false;

    constructor(
        private modalService: NgbModal
    ) {
    }

    ngOnInit() {
        this.nameService = new NameService(undefined);
        const state = this.roundNumber.getState();
        const statePrevious = this.roundNumber.getPrevious()?.getState();
        const nextRoundNumber = this.roundNumber.getNext();
        const stateNext = nextRoundNumber?.getState();
        const nextNeedsRanking = nextRoundNumber?.needsRanking() ?? false;
        if (state === State.InProgress) {
            this.show = true;
        } else if (state === State.Created && (statePrevious === undefined || statePrevious === State.Finished)) {
            this.show = true;
        } else if (state === State.Finished && (stateNext === undefined || stateNext === State.Created || !nextNeedsRanking)) {
            this.show = true;
        }
    }

    openModal(templateRef: TemplateRef<any>) {
        this.modalService.open(templateRef);
    }

    getPoules(): Poule[] {
        return this.roundNumber.getPoules().filter(poule => poule.needsRanking());
    }
}
