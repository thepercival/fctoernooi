import { Component, Input } from '@angular/core';
import { NameService, Poule, PoulePlace, QualifyGroup, RankingService, RoundRankingItem } from 'ngx-sport';

import { PoulesRankingScreen } from '../../lib/liveboard/screens';

@Component({
    selector: 'app-tournament-liveboard-poules',
    templateUrl: './poules.liveboard.component.html',
    styleUrls: ['./poules.liveboard.component.scss']
})
export class TournamentLiveboardPoulesComponent {
    @Input() screen: PoulesRankingScreen;
    @Input() ruleSet: number;

    constructor(
        public nameService: NameService
    ) {
    }

    getRankingItems(poule: Poule): RoundRankingItem[] {
        const ranking = new RankingService(this.ruleSet);
        return ranking.getItemsForPoule(poule);
    }

    getQualificationClass(poule: Poule, poulePlaceNumber: number): {} {
        console.error("getQualificationClass");
        return {};
        // const poulePlace: PoulePlace = poule.getPlace(poulePlaceNumber);
        // const rules = poulePlace.getToQualifyRules();
        // if (rules.length === 2) {
        //     return { icon: 'circle', text: 'text-warning' };
        // } else if (rules.length === 1) {
        //     const qualifyRule = rules[0];
        //     const singleColor = this.getClassPostfix(qualifyRule.getWinnersOrLosers());
        //     return { icon: 'circle', text: 'text-' + (qualifyRule.isMultiple() ? 'warning' : singleColor) };
        // }
        // return { icon: undefined, text: '' };
    }

    private getClassPostfix(winnersOrLosers: number): string {
        return winnersOrLosers === QualifyGroup.WINNERS ? 'success' : (winnersOrLosers === QualifyGroup.LOSERS ? 'danger' : '');
    }

    getPoulePlace(rankingItem: RoundRankingItem): PoulePlace {
        return rankingItem.getRound().getPoulePlace(rankingItem.getPoulePlaceLocation());
    }
}