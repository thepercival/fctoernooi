import { InjectionToken } from '@angular/core';
import { Tournament } from '../../lib/tournament';
import { TournamentRegistration } from '../../lib/tournament/registration';

export interface TournamentRegistrationProcessModalInputs {
    registration: TournamentRegistration;
    tournament: Tournament;
}

export const TOURNAMENT_REGISTRATION_PROCESS_MODAL_INPUTS = new InjectionToken<TournamentRegistrationProcessModalInputs>('TOURNAMENT_REGISTRATION_PROCESS_MODAL_INPUTS');
