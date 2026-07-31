import { InjectionToken } from '@angular/core';
import { GameMode } from 'ngx-sport';

export interface GameModeModalInputs {
    defaultGameMode?: GameMode;
}

export const GAME_MODE_MODAL_INPUTS = new InjectionToken<GameModeModalInputs>('GAME_MODE_MODAL_INPUTS');
