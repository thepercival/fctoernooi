import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameMode, RankingRuleSet, RankingService } from 'ngx-sport';

@Component({
    selector: 'app-ranking-rules',
    templateUrl: './rankingrules.component.html',
    styleUrls: ['./rankingrules.component.scss']
})
export class RankingRulesComponent {
    @Input() rankingRuleSet!: RankingRuleSet;
    @Input() editMode: boolean = false;
    @Output() changed = new EventEmitter<RankingRuleSet>();

    constructor() { }

    getDescription(): string[] {
        const rankingService = new RankingService(GameMode.Against, this.rankingRuleSet);
        return rankingService.getRuleDescriptions();
    }

    toggle() {
        if (this.rankingRuleSet === RankingRuleSet.WC) {
            this.rankingRuleSet = RankingRuleSet.EC;
        } else {
            this.rankingRuleSet = RankingRuleSet.WC;
        }
        this.changed.emit(this.rankingRuleSet);
    }
}
