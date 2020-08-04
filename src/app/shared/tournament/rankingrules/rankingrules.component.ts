import { Component, Input } from '@angular/core';
import { RankingService } from 'ngx-sport';
import { Tournament } from '../../../lib/tournament';

@Component({
    selector: 'app-ranking-rules',
    templateUrl: './rankingrules.component.html',
    styleUrls: ['./rankingrules.component.scss']
})
export class RankingRulesComponent {
    @Input() ruleSet: number;

    constructor() { }

    getDescription(): string[] {
        const rankingService = new RankingService(undefined, this.ruleSet);
        return rankingService.getRuleDescriptions();
    }
}
