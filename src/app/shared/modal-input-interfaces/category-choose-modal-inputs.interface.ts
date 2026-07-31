import { InjectionToken } from '@angular/core';
import { Category } from 'ngx-sport';
import { Tournament } from '../../lib/tournament';

export interface CategoryChooseModalInputs {
    categories: Category[];
    tournament: Tournament;
}

export const CATEGORY_CHOOSE_MODAL_INPUTS = new InjectionToken<CategoryChooseModalInputs>('CATEGORY_CHOOSE_MODAL_INPUTS');
