import { InjectionToken } from '@angular/core';
import { Category } from 'ngx-sport';

export interface CategoryModalInputs {
    categories: Category[];
    buttonLabel: string;
    category?: Category;
}

export const CATEGORY_MODAL_INPUTS = new InjectionToken<CategoryModalInputs>('CATEGORY_MODAL_INPUTS');
