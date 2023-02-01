import { Injectable } from '@angular/core';
import { CustomSportId } from '../ngx-sport/sport/custom';

@Injectable({
    providedIn: 'root'
})
export class TranslateSportService {
    static readonly language = 'nl';

    getSportName(customSportId: CustomSportId, defaultValue: string): string {
        switch (customSportId) {
            case CustomSportId.Badminton: { return 'badminton'; }
            case CustomSportId.Basketball: { return 'basketbal'; }
            case CustomSportId.Darts: { return 'darten'; }
            case CustomSportId.ESports: { return 'e-sporten'; }
            case CustomSportId.Hockey: { return 'hockey'; }
            case CustomSportId.Baseball: { return 'honkbal'; }
            case CustomSportId.Korfball: { return 'korfbal'; }
            case CustomSportId.Chess: { return 'schaken'; }
            case CustomSportId.Squash: { return 'squash'; }
            case CustomSportId.TableTennis: { return 'tafeltennis'; }
            case CustomSportId.Tennis: { return 'tennis'; }
            case CustomSportId.Football: { return 'voetbal'; }
            case CustomSportId.Volleyball: { return 'volleybal'; }
            case CustomSportId.IceHockey: { return 'ijshockey'; }
            case CustomSportId.Shuffleboard: { return 'sjoelen'; }
            case CustomSportId.Jass: { return 'klaverjassen'; }
            case CustomSportId.Padel: { return 'padel'; }
            case CustomSportId.Rugby: { return 'rugby'; }
        }
        return defaultValue;
    }
}
