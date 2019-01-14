import { Component, Input } from '@angular/core';
import { Game, NameService, Poule, PoulePlace, Ranking, RankingItem, Round } from 'ngx-sport';

import { PoulesRankingScreen } from './screens';

@Component({
    selector: 'app-tournament-liveboard-poules',
    templateUrl: './poules.liveboard.component.html',
    styleUrls: []
})
export class TournamentLiveboardPoulesComponent {

    @Input() screen: PoulesRankingScreen;
    @Input() ranking: Ranking;

    constructor(
        public nameService: NameService
    ) {
    }

    getRankingItems(poule: Poule): RankingItem[] {
        return this.ranking.getItems(poule.getPlaces(), poule.getGames());
    }

    getQualificationClass(poule: Poule, poulePlaceNumber: number): {} {
        const poulePlace: PoulePlace = poule.getPlace(poulePlaceNumber);
        const rules = poulePlace.getToQualifyRules();
        if (rules.length === 2) {
            return { icon: 'circle', text: 'text-warning' };
        } else if (rules.length === 1) {
            const qualifyRule = rules[0];
            const singleColor = this.getClassPostfix(qualifyRule.getWinnersOrLosers());
            return { icon: 'circle', text: 'text-' + (qualifyRule.isMultiple() ? 'warning' : singleColor) };
        }
        return { icon: undefined, text: '' };
    }

    private getClassPostfix(winnersOrLosers: number): string {
        return winnersOrLosers === Round.WINNERS ? 'success' : (winnersOrLosers === Round.LOSERS ? 'danger' : '');
    }

    getUnitDifference(poulePlace: PoulePlace, games: Game[]) {
        const nrOfUnitsScored = this.ranking.getNrOfUnitsScored(poulePlace, games);
        const nrOfUnitsReceived = this.ranking.getNrOfUnitsReceived(poulePlace, games);
        return (nrOfUnitsScored - nrOfUnitsReceived) + ' ( ' + nrOfUnitsScored + ' - ' + nrOfUnitsReceived + ' )';
    }
}