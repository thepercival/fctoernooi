import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NameService, RankingRuleSet } from 'ngx-sport';

@Component({
    selector: 'app-ranking-rules',
    templateUrl: './rankingrules.component.html',
    styleUrls: ['./rankingrules.component.scss']
})
export class RankingRulesComponent {
    @Input() rankingRuleSet!: RankingRuleSet;
    @Input() editMode: boolean = false;
    @Output() changed = new EventEmitter<RankingRuleSet>();

    protected nameService: NameService;

    constructor() {
        this.nameService = new NameService();
    }

    getDescription(): string[] {
        return this.nameService.getRulesName(this.rankingRuleSet);
    }

    toggle() {
        if (this.rankingRuleSet === RankingRuleSet.Against) {
            this.rankingRuleSet = RankingRuleSet.AgainstAmong;
        } else {
            this.rankingRuleSet = RankingRuleSet.Against;
        }
        this.changed.emit(this.rankingRuleSet);
    }
}
