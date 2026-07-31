import { InjectionToken } from '@angular/core';

export interface CopyModalInputs {
    name: string;
    startDateTime: Date;
    showLowCreditsWarning: boolean;
}

export const COPY_MODAL_INPUTS = new InjectionToken<CopyModalInputs>('COPY_MODAL_INPUTS');
