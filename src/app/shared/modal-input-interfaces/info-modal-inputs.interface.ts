import { InjectionToken, TemplateRef } from '@angular/core';

export interface InfoModalInputs {
    header: string;
    modalContent: TemplateRef<any>;
    noHeaderBorder?: boolean;
}

export const INFO_MODAL_INPUTS = new InjectionToken<InfoModalInputs>('INFO_MODAL_INPUTS');
