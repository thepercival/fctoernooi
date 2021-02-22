import { JsonIdentifiable } from "ngx-sport";

export interface JsonSponsor extends JsonIdentifiable {
    name: string;
    url?: string;
    logoUrl?: string;
    screenNr?: number;
}
