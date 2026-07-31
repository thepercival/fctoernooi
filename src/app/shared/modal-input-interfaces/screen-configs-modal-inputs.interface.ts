import { InjectionToken } from '@angular/core';
import { ScreenConfig } from '../../lib/liveboard/screenConfig/json';

export interface ScreenConfigsModalInputs {
    screenConfigs: ScreenConfig[];
}

export const SCREEN_CONFIGS_MODAL_INPUTS = new InjectionToken<ScreenConfigsModalInputs>('SCREEN_CONFIGS_MODAL_INPUTS');
