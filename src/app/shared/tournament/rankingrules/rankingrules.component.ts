import { Component, Input, output } from '@angular/core';
import { AgainstRuleSet, NameService } from 'ngx-sport';

@Component({
    selector: 'app-ranking-rules',
    templateUrl: './rankingrules.component.html',
    styleUrls: ['./rankingrules.component.scss']
})
export class RankingRulesComponent {
    @Input() againstRuleSet!: AgainstRuleSet;
    @Input() editMode: boolean = false;
    onRuleSetChanged = output<AgainstRuleSet>();

    protected nameService: NameService;

    constructor() {
        this.nameService = new NameService();
    }

    getDescription(): string[] {
        return this.nameService.getRulesName(this.againstRuleSet);
    }

    toggle() {
        if (this.againstRuleSet === AgainstRuleSet.DiffFirst) {
            this.againstRuleSet = AgainstRuleSet.AmongFirst;
        } else {
            this.againstRuleSet = AgainstRuleSet.DiffFirst;
        }
        this.onRuleSetChanged.emit(this.againstRuleSet);
    }
}
