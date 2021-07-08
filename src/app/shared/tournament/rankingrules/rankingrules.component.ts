import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AgainstRuleSet, NameService } from 'ngx-sport';

@Component({
    selector: 'app-ranking-rules',
    templateUrl: './rankingrules.component.html',
    styleUrls: ['./rankingrules.component.scss']
})
export class RankingRulesComponent {
    @Input() againstRuleSet!: AgainstRuleSet;
    @Input() editMode: boolean = false;
    @Output() changed = new EventEmitter<AgainstRuleSet>();

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
        this.changed.emit(this.againstRuleSet);
    }
}
