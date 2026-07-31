import { InjectionToken } from '@angular/core';

export interface CopiedModalInputs {
    previousId: string;
    title: string;
}

export const COPIED_MODAL_INPUTS = new InjectionToken<CopiedModalInputs>('COPIED_MODAL_INPUTS');
