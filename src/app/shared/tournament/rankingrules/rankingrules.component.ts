import { Component, Input } from '@angular/core';
import { RankingService } from 'ngx-sport';
import { Tournament } from '../../../lib/tournament';

@Component({
    selector: 'app-ranking-rules',
    templateUrl: './rankingrules.component.html',
    styleUrls: ['./rankingrules.component.scss']
})
export class RankingRulesComponent {
    @Input() tournament: Tournament;
    constructor() { }

    getDescription(): string[] {
        const ruleSet = this.tournament.getCompetition().getRuleSet();
        const rankingService = new RankingService(undefined, ruleSet);
        return rankingService.getRuleDescriptions();
    }
}
