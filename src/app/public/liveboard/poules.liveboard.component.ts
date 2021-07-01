import { Component, Input } from '@angular/core';
import { AgainstSportRoundRankingCalculator, AgainstSportVariant, NameService, Poule, SportRoundRankingItem, TogetherSportRoundRankingCalculator } from 'ngx-sport';

import { CSSService } from '../../shared/common/cssservice';
import { PoulesRankingScreen } from '../../lib/liveboard/screens';

@Component({
    selector: 'app-tournament-liveboard-poules',
    templateUrl: './poules.liveboard.component.html',
    styleUrls: ['./poules.liveboard.component.scss']
})
export class LiveboardPoulesComponent {
    @Input() screen!: PoulesRankingScreen;
    @Input() ruleSet!: number;
    @Input() nameService!: NameService;

    constructor(
        public cssService: CSSService
    ) {
    }

    getRankingItems(poule: Poule): SportRoundRankingItem[] {
        return this.getCalculator().getItemsForPoule(poule);
    }

    getCalculator(): AgainstSportRoundRankingCalculator | TogetherSportRoundRankingCalculator {
        const competitionSport = this.screen.getCompetitionSport();
        if (this.isAgainstSportVariant()) {
            return new AgainstSportRoundRankingCalculator(competitionSport);
        }
        return new TogetherSportRoundRankingCalculator(competitionSport);
    }

    hasMultipleSports(): boolean {
        return this.screen.getCompetitionSport().getCompetition().hasMultipleSports();
    }

    isAgainstSportVariant(): boolean {
        return this.screen.getCompetitionSport().getVariant() instanceof AgainstSportVariant;
    }
}