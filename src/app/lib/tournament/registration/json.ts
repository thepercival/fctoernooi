import { JsonIdentifiable, JsonStartLocation } from "ngx-sport";
import { RegistrationState } from "./state";

export interface JsonTournamentRegistration extends JsonIdentifiable {
    state: RegistrationState;
    name: string;
    emailaddress: string;
    telephone: string;
    info: string;
    startLocation: JsonStartLocation |undefined;
}