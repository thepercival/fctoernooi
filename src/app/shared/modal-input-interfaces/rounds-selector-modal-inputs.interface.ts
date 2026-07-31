import { InjectionToken } from '@angular/core';
import { CompetitionSport, Round } from 'ngx-sport';
import { SelectableCategory } from '../../admin/rounds/selector.component';

export interface RoundsSelectorModalInputs {
    subject: string;
    competitionSport: CompetitionSport;
    selectableCategories: SelectableCategory[];
    hasOwnConfig: (round: Round) => boolean;
}

export const ROUNDS_SELECTOR_MODAL_INPUTS = new InjectionToken<RoundsSelectorModalInputs>('ROUNDS_SELECTOR_MODAL_INPUTS');
