import { PlanningService, RoundNumber } from 'ngx-sport';

import { Tournament } from '../tournament';

export class TournamentService {

    constructor(private tournament: Tournament) {

    }

    create(planningService: PlanningService, roundNumber: RoundNumber) {
        if (this.tournament.hasBreak()) {
            planningService.setBlockedPeriod(this.tournament.getBreakStartDateTime(), this.tournament.getBreakDuration());
        }
        planningService.create(roundNumber);
    }

    reschedule(planningService: PlanningService, roundNumber: RoundNumber) {
        if (this.tournament.hasBreak()) {
            planningService.setBlockedPeriod(this.tournament.getBreakStartDateTime(), this.tournament.getBreakDuration());
        }
        planningService.reschedule(roundNumber);
    }
}
