import { InjectionToken } from '@angular/core';
import { Tournament } from '../../lib/tournament';
import { TournamentRegistrationTextSubject } from '../../lib/tournament/registration/text';

export interface TextEditorModalInputs {
    initialText: string;
    header: string;
    tournament: Tournament;
    subject: TournamentRegistrationTextSubject;
}

export const TEXT_EDITOR_MODAL_INPUTS = new InjectionToken<TextEditorModalInputs>('TEXT_EDITOR_MODAL_INPUTS');
