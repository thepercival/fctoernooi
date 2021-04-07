import { Injectable } from '@angular/core';
import { HorizontalPoule, Place, QualifyGroup, QualifyRuleMultiple, QualifyTarget, Round } from 'ngx-sport';

@Injectable()
export class CSSService {
    getQualifyPlace(place: Place): string {
        // TODOSTRUCTURE CDK
        return '';
        // const horizontalPouleWinners = place.getHorizontalPoule(QualifyTarget.Winners);
        // const horizontalPouleLosers = place.getHorizontalPoule(QualifyTarget.Losers);

        // const qualifyGroupWinners: QualifyGroup | undefined = horizontalPouleWinners?.getQualifyGroup();
        // const qualifyGroupLosers: QualifyGroup | undefined = horizontalPouleLosers?.getQualifyGroup();
        // if (!qualifyGroupWinners && !qualifyGroupLosers) {
        //     return '';
        // }
        // if (qualifyGroupWinners && qualifyGroupLosers) {
        //     const partialWinners = (qualifyGroupWinners.getNrOfToPlacesTooMuch() > 0 && horizontalPouleWinners?.isBorderPoule());
        //     const partialLosers = (qualifyGroupLosers.getNrOfToPlacesTooMuch() > 0 && horizontalPouleLosers?.isBorderPoule());
        //     if (partialWinners && partialLosers) {
        //         return 'q-partial q-w-' + this.getQualifyGroupNumber(qualifyGroupWinners) + '-double-partial q-l-'
        //             + this.getQualifyGroupNumber(qualifyGroupLosers) + '-double-partial';
        //     }
        //     if (!partialWinners) {
        //         return 'q-w-' + this.getQualifyGroupNumber(qualifyGroupWinners);
        //     }
        //     return 'q-l-' + this.getQualifyGroupNumber(qualifyGroupLosers);
        // }
        // if (qualifyGroupWinners && horizontalPouleWinners && !qualifyGroupLosers) {
        //     return this.getQualifyPoule(horizontalPouleWinners);
        // }
        // if (horizontalPouleLosers) {
        //     return this.getQualifyPoule(horizontalPouleLosers);
        // }
        // return '';
    }

    protected getQualifyGroupNumber(qualifyGroup: QualifyGroup): number {
        return qualifyGroup.getNumber() > 4 ? 5 : qualifyGroup.getNumber();
    }

    getQualifyPoule(horizontalPoule: HorizontalPoule): string {
        // TODOSTRUCTURE CDK
        return '';
        // const qualifyRule = horizontalPoule.getQualifyRule();
        // if (qualifyRule === undefined) {
        //     return '';
        // }
        // const classes = qualifyRule instanceof QualifyRuleMultiple ? 'q-partial' : '';
        // return classes + ' q-' + this.getQualifyTarget(qualifyRule.getQualifyTarget()) + '-' +
        //     this.getQualifyGroupNumber(qualifyGroup);
    }

    getQualifyTarget(target: QualifyTarget): string {
        return target === QualifyTarget.Winners ? 'w' : 'l';
    }

    getQualifyRound(round: Round, noQualifyClass: string = ''): string {
        const qualifyGroup: QualifyGroup | undefined = round.getParentQualifyGroup();
        if (qualifyGroup === undefined) {
            return noQualifyClass;
        }
        return ' q-' + (qualifyGroup.getTarget() === QualifyTarget.Winners ? 'w' : 'l') + '-' +
            this.getQualifyGroupNumber(qualifyGroup);
    }

    // getWinnersOrLosers(winnersOrLosers: number): string {
    //     return winnersOrLosers === QualifyTarget.Winners ? 'success' : (winnersOrLosers === QualifyTarget.Losers ? 'danger' : '');
    // }
}
