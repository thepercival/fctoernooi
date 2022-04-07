import { ScreenConfigName } from "./name";

export interface ScreenConfig {
    name: ScreenConfigName;
    enabled: boolean;
    nrOfSeconds: number;
}