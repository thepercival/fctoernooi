import { Component, Input } from '@angular/core';
<<<<<<< HEAD
import { NameService, Poule, Place, RankingService, RoundRankingItem } from 'ngx-sport';
=======
import { NameService, Poule, RankedRoundItem, RankingService } from 'ngx-sport';
>>>>>>> 69fba412e881afb86e96b578edc3d3c0e5e1c69f

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

<<<<<<< HEAD
    getRankingItems(poule: Poule): RoundRankingItem[] {
        const ranking = new RankingService(poule.getRound(), this.ruleSet);
        return ranking.getItemsForPoule(poule);
    }

    getPlace(rankingItem: RoundRankingItem): Place {
        return rankingItem.getRound().getPlace(rankingItem.getPlaceLocation());
    }
=======
    getRankingItems(poule: Poule): RankedRoundItem[] {
        const ranking = new RankingService(poule.getRound(), this.ruleSet);
        return ranking.getItemsForPoule(poule);
    }
>>>>>>> 69fba412e881afb86e96b578edc3d3c0e5e1c69f
}