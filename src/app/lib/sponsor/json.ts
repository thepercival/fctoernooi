import { JsonIdentifiable } from "ngx-sport";

export interface JsonSponsor extends JsonIdentifiable {
    name: string;
    url?: string;
    logoExtension?: string|undefined;
    screenNr?: number;
}
