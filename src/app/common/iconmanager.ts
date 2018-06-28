import { Injectable } from '@angular/core';
import { SportConfig } from 'ngx-sport';

@Injectable()
export class IconManager {
    getIconClass(sportName: string): string {
        if (sportName === SportConfig.Football) {
            return 'futbol';
        } else if (sportName === SportConfig.TableTennis) {
            return 'table-tennis';
        } else if (sportName === SportConfig.Darts) {
            return 'fi flaticon-darts';
        } else if (sportName === SportConfig.Tennis) {
            return 'fi flaticon-tennis';
        } else if (sportName === SportConfig.Volleyball) {
            return 'fi flaticon-volleyball';
        } else if (sportName === SportConfig.Badminton) {
            return 'fi flaticon-badminton';
        } else if (sportName === SportConfig.Squash) {
            return 'fi flaticon-squash';
        } else if (sportName === SportConfig.Hockey) {
            return 'fi flaticon-hockey';
        }
        return undefined;
    }

    getIconType(sportName: string): string {
        if (sportName === SportConfig.Football || sportName === SportConfig.TableTennis) {
            return 'fa';
        }
        return 'fi';
    }
}
