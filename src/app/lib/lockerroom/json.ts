import { JsonIdentifiable } from "ngx-sport";

export interface JsonLockerRoom extends JsonIdentifiable {
    name: string;
    competitorIds: number[];
}
