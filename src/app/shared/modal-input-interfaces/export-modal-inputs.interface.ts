import { InjectionToken } from '@angular/core';
import { Tournament } from '../../lib/tournament';
import { TournamentRegistrationSettings } from '../../lib/tournament/registration/settings';

export interface ExportModalInputs {
    tournament: Tournament;
    settings?: TournamentRegistrationSettings;
    subjects: number;
    readonlySubjects: number;
    fieldDescription: string;
}

export const EXPORT_MODAL_INPUTS = new InjectionToken<ExportModalInputs>('EXPORT_MODAL_INPUTS');
