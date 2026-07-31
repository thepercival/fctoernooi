import { InjectionToken } from '@angular/core';
import { Tournament } from '../../lib/tournament';

export interface ShareModalInputs {
    tournament: Tournament;
    publicInitial: boolean;
}

export const SHARE_MODAL_INPUTS = new InjectionToken<ShareModalInputs>('SHARE_MODAL_INPUTS');
