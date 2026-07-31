import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { AgainstRuleSet, AgainstSportRoundRankingCalculator, AgainstVariant, Poule, SportRoundRankingItem, StructureNameService, TogetherSportRoundRankingCalculator } from 'ngx-sport';

import { CSSService } from '../../shared/common/cssservice';
import { PoulesRankingScreen } from '../../lib/liveboard/screens';
import { EscapeHtmlPipe } from '../../shared/common/escapehtmlpipe';
import { NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-tournament-liveboard-poules',
    templateUrl: './poules.liveboard.component.html',
    styleUrls: ['./poules.liveboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [EscapeHtmlPipe, NgTemplateOutlet]
    
})
export class LiveboardPoulesComponent {
    cssService = inject(CSSService);

    @Input() screen!: PoulesRankingScreen;
    @Input() ruleSet!: AgainstRuleSet;
    @Input() structureNameService!: StructureNameService;
    constructor() {
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
        return this.screen.getCompetitionSport().getVariant() instanceof AgainstVariant;
    }
}