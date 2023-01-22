import { Period, PlanningConfig } from "ngx-sport";
import { Recess } from "../recess";
import { Tournament } from "../tournament";

export class RecessValidator {
    public validateNewPeriod(recessPeriod: Period, currentRecessPeriods: Period[], minStartDate: Date): string | undefined {
        let msg = this.validateSwapped(recessPeriod);
        if (msg !== undefined) {
            return msg;
        }

        msg = this.validateBeforeStart(recessPeriod, minStartDate);
        if (msg !== undefined) {
            return msg;
        }
        
        return this.validateOverlapping(recessPeriod, currentRecessPeriods);
    }

    protected validateSwapped(recessPeriod: Period): string | undefined {    
        if (recessPeriod.getStartDateTime().getTime() >= recessPeriod.getEndDateTime().getTime()) {
            return 'de start van de pauze moet voor het einde van de pauze zijn';
        }
        return undefined;    
    }

    protected validateBeforeStart(recessPeriod: Period, minStartDate: Date): string | undefined {        
        // console.log(recessPeriod.getStartDateTime(), minStartDate);
        if (recessPeriod.getStartDateTime().getTime() < minStartDate.getTime()) {
            return 'de pauze moet na het einde van de eerste wedstrijd beginnen';
        }
        return undefined;
    }

    protected validateOverlapping(recessPeriod: Period, currentRecessPeriods: Period[]): string | undefined {
        const overlap = currentRecessPeriods.some((recessPeriodIt: Period): boolean => {
            return recessPeriodIt.overlaps(recessPeriod);
        });
        return overlap ? 'er is een overlapping met een andere pauze' : undefined;
    }
}