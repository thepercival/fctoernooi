import { JsonIdentifiable } from "ngx-sport";

export interface JsonTournamentInvitation extends JsonIdentifiable {
    emailaddress: string;
    roles: number;
}