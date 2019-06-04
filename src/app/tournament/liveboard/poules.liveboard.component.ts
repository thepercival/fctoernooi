import { Component, Input } from '@angular/core';
import { NameService, Poule, Place, RankingService, RoundRankingItem } from 'ngx-sport';

import { CSSService } from '../../common/cssservice';
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
        public nameService: NameService,
        public cssService: CSSService
    ) {
    }

    getRankingItems(poule: Poule): RoundRankingItem[] {
        const ranking = new RankingService(poule.getRound(), this.ruleSet);
        return ranking.getItemsForPoule(poule);
    }

    getPlace(rankingItem: RoundRankingItem): Place {
        return rankingItem.getRound().getPlace(rankingItem.getPlaceLocation());
    }
}