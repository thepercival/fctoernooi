import { Injectable } from '@angular/core';
import { HorizontalPoule, Place, QualifyGroup, MultipleQualifyRule, QualifyTarget, Round, SingleQualifyRule } from 'ngx-sport';

@Injectable()
export class CSSService {
    getQualifyPlace(place: Place): string {
        const horPouleWinners = place.getHorizontalPoule(QualifyTarget.Winners);
        const horPouleLosers = place.getHorizontalPoule(QualifyTarget.Losers);

        const winnersRule: SingleQualifyRule | MultipleQualifyRule | undefined = horPouleWinners.getQualifyRule();
        const losersRule: SingleQualifyRule | MultipleQualifyRule | undefined = horPouleLosers.getQualifyRule();

        if (winnersRule !== undefined && losersRule !== undefined) {
            const partialWinners = winnersRule instanceof MultipleQualifyRule;
            const partialLosers = losersRule instanceof MultipleQualifyRule;
            if (partialWinners && partialLosers) {
                return 'q-partial q-w-' + this.getQualifyGroupNumber(winnersRule.getGroup()) + '-double-partial q-l-'
                    + this.getQualifyGroupNumber(losersRule.getGroup()) + '-double-partial';
            } else if (!partialWinners) {
                return 'q-w-' + this.getQualifyGroupNumber(winnersRule.getGroup());
            }
            return 'q-l-' + this.getQualifyGroupNumber(losersRule.getGroup());
        } else if (winnersRule !== undefined) {
            return this.getQualifyRule(winnersRule);
        } else if (losersRule !== undefined) {
            return this.getQualifyRule(losersRule);
        }
        return '';
    }

    protected getQualifyGroupNumber(qualifyGroup: QualifyGroup): number {
        return qualifyGroup.getNumber() > 4 ? 5 : qualifyGroup.getNumber();
    }

    getQualifyPoule(horPoule: HorizontalPoule): string {
        const qualifyRule = horPoule.getQualifyRule();
        if (qualifyRule === undefined) {
            return '';
        }
        return this.getQualifyRule(qualifyRule);
    }

    getQualifyRule(rule: SingleQualifyRule | MultipleQualifyRule): string {
        const classes = rule instanceof MultipleQualifyRule ? 'q-partial' : '';
        return classes + this.getQualifyGroup(rule.getGroup());
    }

    getQualifyGroup(qualifyGroup: QualifyGroup): string {
        return ' q-' + qualifyGroup.getTarget().toLowerCase() + '-' + this.getQualifyGroupNumber(qualifyGroup);
    }

    getQualifyRound(round: Round, noQualifyClass: string = ''): string {
        const qualifyGroup: QualifyGroup | undefined = round.getParentQualifyGroup();
        if (qualifyGroup === undefined) {
            return noQualifyClass;
        }
        return ' q-' + (qualifyGroup.getTarget() === QualifyTarget.Winners ? 'w' : 'l') + '-' +
            this.getQualifyGroupNumber(qualifyGroup);
    }
}
