import { Period } from "ngx-sport";
import { Recess } from "../recess";
import { Tournament } from "../tournament";

export class RecessValidator {
    public validateNewPeriod(recessPeriod: Period, tournament: Tournament): string | undefined {
        let msg = this.validateBeforeCompetitionStart(recessPeriod, tournament);
        if (msg !== undefined) {
            return msg;
        }
        return this.validateOverlapping(recessPeriod, tournament);
    }

    protected validateBeforeCompetitionStart(recessPeriod: Period, tournament: Tournament): string | undefined {
        const competitionStart = tournament.getCompetition().getStartDateTime();
        if (recessPeriod.getEndDateTime().getTime() <= competitionStart.getTime()) {
            return 'er is een pauze voordat het toernooi start';
        }
        return undefined;
    }

    protected validateOverlapping(recessPeriod: Period, tournament: Tournament): string | undefined {
        const overlap = tournament.getRecesses().some((recessIt: Recess): boolean => {
            return recessIt.overlaps(recessPeriod);
        });
        if (overlap === undefined) {
            return undefined;
        }
        return 'er is een overlapping met een andere pauze';
    }
}