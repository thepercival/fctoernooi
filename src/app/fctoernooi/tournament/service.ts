import { Tournament } from '../tournament';
import { PlanningService } from 'ngx-sport';

export class TournamentService {

    constructor(private tournament: Tournament) {
        // this.allRoundsByNumber = this.structureService.getAllRoundsByNumber();
        // looping through rounds!! in constructor planningservice, made wc possible
    }

    create(planningService: PlanningService, roundNumber: number ) {
        if (this.tournament.hasBreak()) {
            planningService.setBlockedPeriod(this.tournament.getBreakStartDateTime(), this.tournament.getBreakDuration());
        }
        planningService.create(roundNumber);
    }

    reschedule(planningService: PlanningService, roundNumber: number ) {
        if (this.tournament.hasBreak()) {
            planningService.setBlockedPeriod(this.tournament.getBreakStartDateTime(), this.tournament.getBreakDuration());
        }
        planningService.reschedule(roundNumber);
    }
}

