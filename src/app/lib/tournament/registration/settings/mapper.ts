import { Injectable } from '@angular/core';

import { JsonRegistrationSettings } from './json';
import { TournamentRegistrationSettings } from '../settings';

@Injectable({
    providedIn: 'root'
})
export class TournamentRegistrationSettingsMapper {
    constructor() { }

    toObject(json: JsonRegistrationSettings): TournamentRegistrationSettings {
        const settings = new TournamentRegistrationSettings(
            json.enabled, 
            new Date(json.end),
            json.mailAlert,
            json.remark);
        settings.setId(json.id);
        return settings;
    }

    toJson(settings: TournamentRegistrationSettings): JsonRegistrationSettings {
        return {
            id: settings.getId(),
            enabled: settings.isEnabled(),
            end: settings.getEnd().toISOString(),
            mailAlert: settings.hasMailAlert(),
            remark: settings.getRemark(),
        };
    }
}
