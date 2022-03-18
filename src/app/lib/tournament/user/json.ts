import { JsonIdentifiable } from "ngx-sport";

export interface JsonTournamentUser extends JsonIdentifiable {
    user: JsonIdentifiable;
    roles: number;
}