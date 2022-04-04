import { JsonIdentifiable } from "ngx-sport";
import { ScreenConfigName } from "./name";

export interface ScreenConfig extends JsonIdentifiable {
    name: ScreenConfigName;
    enabled: boolean;
    nrOfSeconds: number;
}