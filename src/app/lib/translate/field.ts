import { Injectable } from '@angular/core';
import { CustomSportId } from '../ngx-sport/sport/custom';

@Injectable({
    providedIn: 'root'
})
export class TranslateFieldService {
    static readonly language = 'nl';

    getFieldNameSingular(customSportId: CustomSportId| undefined): string {
        switch (customSportId) {
            case CustomSportId.Darts:
            case CustomSportId.Chess:
                {
                    return 'bord';
                }
            case CustomSportId.Badminton:
            case CustomSportId.Squash:
            case CustomSportId.Tennis:
            case CustomSportId.Padel:
                {
                    return 'baan';
                }
            case CustomSportId.TableTennis:
            case CustomSportId.Jass:
                {
                    return 'tafel';
                }
            case CustomSportId.Shuffleboard:
                {
                    return 'bak';
                }
        }
        return 'veld';
    }

    getFieldNamePlural(customSportId: CustomSportId|undefined): string {
        if( customSportId === undefined) {
            return '';    
        }
        const single = this.getFieldNameSingular(customSportId);
        switch (single) {
            case 'veld': { return 'velden'; }
            case 'bord': { return 'borden'; }
            case 'baan': { return 'banen'; }
            case 'tafel': { return 'tafels'; }
            case 'bak': { return 'bakken'; }
        }
        return '';
    }
}
