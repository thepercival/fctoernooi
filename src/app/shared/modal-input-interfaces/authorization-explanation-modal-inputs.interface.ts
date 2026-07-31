import { InjectionToken } from '@angular/core';

export interface AuthorizationExplanationModalInputs {
    header: string;
    showAdd: boolean;
}

export const AUTHORIZATION_EXPLANATION_MODAL_INPUTS = new InjectionToken<AuthorizationExplanationModalInputs>('AUTHORIZATION_EXPLANATION_MODAL_INPUTS');
