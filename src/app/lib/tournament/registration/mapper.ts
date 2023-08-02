import { Injectable } from '@angular/core';

import { JsonTournamentRegistration } from './json';
import { TournamentRegistration } from '../registration';
import { Category, CategoryMapper, StartLocation } from 'ngx-sport';
import { RegistrationState } from './state';

@Injectable({
    providedIn: 'root'
})
export class TournamentRegistrationMapper {
    constructor(private categoryMapper: CategoryMapper) { }

    toObject(json: JsonTournamentRegistration, category: Category): TournamentRegistration {
        const registration = new TournamentRegistration(
            json.state,
            json.name,
            json.emailaddress,
            json.telephone,
            category,
            json.info );
        registration.setId(json.id);
        
        if (json.startLocation ) {
            registration.setStartLocation(new StartLocation(             
                    category.getNumber(),
                    json.startLocation.pouleNr,
                    json.startLocation.placeNr
                )
            );
        }
        
        return registration;
    }

    updateObject(json: JsonTournamentRegistration, registration: TournamentRegistration): TournamentRegistration {
        registration.setName(json.name);
        registration.setEmailaddress(json.emailaddress);
        registration.setTelephone(json.telephone);
        registration.setInfo(json.info);
        return registration;
    }

    toJson(registration: TournamentRegistration, state: RegistrationState): JsonTournamentRegistration {
        return {
            id: registration.getId(),
            state: state,
            name: registration.getName(),
            emailaddress: registration.getEmailaddress(),
            telephone: registration.getTelephone(),
            info: registration.getInfo(),
            startLocation: undefined
        };
    }
}
