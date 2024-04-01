import { JsonIdentifiable } from "ngx-sport";

export interface JsonTournamentRule extends JsonIdentifiable {
    text: string; 
    priority: number;
}