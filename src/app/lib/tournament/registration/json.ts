import { JsonCategory, JsonIdentifiable } from "ngx-sport";
import { JsonPlaceLocation } from "ngx-sport/src/place/location/json";
import { RegistrationState } from "./state";

export interface JsonTournamentRegistration extends JsonIdentifiable {
    state: RegistrationState;
    name: string;
    emailaddress: string;
    telephone: string;
    info: string;
    startLocation: JsonPlaceLocation |undefined;
}