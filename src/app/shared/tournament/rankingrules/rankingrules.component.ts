import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { AgainstRuleSet, NameService } from 'ngx-sport';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';

@Component({
    selector: 'app-ranking-rules',
    templateUrl: './rankingrules.component.html',
    styleUrls: ['./rankingrules.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingRulesComponent {
    readonly _againstRuleSet = input.required<AgainstRuleSet>();
    readonly _editMode = input(false);
    readonly onRuleSetChanged = output<AgainstRuleSet>();

    private readonly currentRuleSet = signal<AgainstRuleSet>(AgainstRuleSet.DiffFirst);

    protected nameService: NameService;

    constructor() {
        this.nameService = new NameService();
        effect(() => {
            this.currentRuleSet.set(this._againstRuleSet());
        });
    }

    getDescription(): string[] {
        return this.nameService.getRulesName(this.currentRuleSet());
    }

    toggle() {
        if (this.currentRuleSet() === AgainstRuleSet.DiffFirst) {
            this.currentRuleSet.set(AgainstRuleSet.AmongFirst);
        } else {
            this.currentRuleSet.set(AgainstRuleSet.DiffFirst);
        }
        this.onRuleSetChanged.emit(this.currentRuleSet());
    }

    get editMode(): boolean {
        return this._editMode();
    }
}
