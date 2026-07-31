import { InjectionToken } from '@angular/core';
import { Structure } from 'ngx-sport';

export interface RoundNumbersSelectorModalInputs {
    structure: Structure;
    subject: string;
}

export const ROUND_NUMBERS_SELECTOR_MODAL_INPUTS = new InjectionToken<RoundNumbersSelectorModalInputs>('ROUND_NUMBERS_SELECTOR_MODAL_INPUTS');
