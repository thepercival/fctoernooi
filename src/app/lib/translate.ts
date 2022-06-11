import { Injectable } from '@angular/core';
import { Sport, ScoreConfig, CustomSport } from 'ngx-sport';

@Injectable({
    providedIn: 'root'
})
export class TranslateService {
    static readonly language = 'nl';

    getSportName(customSport: CustomSport, defaultValue: string): string {
        switch (customSport) {
            case CustomSport.Badminton: { return 'badminton'; }
            case CustomSport.Basketball: { return 'basketbal'; }
            case CustomSport.Darts: { return 'darten'; }
            case CustomSport.ESports: { return 'e-sporten'; }
            case CustomSport.Hockey: { return 'hockey'; }
            case CustomSport.Baseball: { return 'honkbal'; }
            case CustomSport.Korfball: { return 'korfbal'; }
            case CustomSport.Chess: { return 'schaken'; }
            case CustomSport.Squash: { return 'squash'; }
            case CustomSport.TableTennis: { return 'tafeltennis'; }
            case CustomSport.Tennis: { return 'tennis'; }
            case CustomSport.Football: { return 'voetbal'; }
            case CustomSport.Volleyball: { return 'volleybal'; }
            case CustomSport.IceHockey: { return 'ijshockey'; }
            case CustomSport.Shuffleboard: { return 'sjoelen'; }
            case CustomSport.Jass: { return 'klaverjassen'; }
            case CustomSport.Padel: { return 'padel'; }
            case CustomSport.Rugby: { return 'rugby'; }
        }
        return defaultValue;
    }

    getScoreNameSingular(scoreConfig: ScoreConfig): string {
        const customId = scoreConfig.getCompetitionSport().getSport().getCustomId();
        if (scoreConfig.isFirst()) {
            return this.getFirstScoreNameSingular(customId);
        }
        return this.getLastScoreNameSingular(customId);
    }

    protected getFirstScoreNameSingular(customId: CustomSport): string {
        switch (customId) {
            case CustomSport.Darts: { return 'leg'; }
            case CustomSport.Tennis:
            case CustomSport.Padel: {
                return 'game';
            }
            case CustomSport.Football:
            case CustomSport.Hockey: {
                return 'goal';
            }
        }
        return 'punt';
    }

    protected getLastScoreNameSingular(customId: number): string {
        switch (customId) {
            case CustomSport.Jass: {
                return 'boom';
            }
            case CustomSport.Badminton:
            case CustomSport.Squash:
            case CustomSport.TableTennis:
            case CustomSport.Tennis:
            case CustomSport.Padel:
            case CustomSport.Volleyball:
            case CustomSport.Darts: {
                return 'set';
            }
        }
        return '';
    }

    getScoreNamePlural(scoreConfig: ScoreConfig): string {
        const customId = scoreConfig.getCompetitionSport().getSport().getCustomId();
        const getScoreNamePluralHelper = (isFirst: boolean, customId: number): string => {
            if (isFirst) {
                return this.getFirstScoreNamePlural(customId);
            }
            return this.getLastScoreNamePlural(customId);
        };
        return getScoreNamePluralHelper(scoreConfig.isFirst(), customId);
    }

    protected getFirstScoreNamePlural(customId: number): string {
        switch (customId) {
            case CustomSport.Darts: { return 'legs'; }
            case CustomSport.Tennis:
            case CustomSport.Padel: {
                return 'games';
            }
            case CustomSport.Football:
            case CustomSport.Hockey: {
                return 'goals';
            }
        }
        return 'punten';
    }

    protected getLastScoreNamePlural(customId: CustomSport): string {
        switch (customId) {
            case CustomSport.Jass: {
                return 'bomem';
            }
            case CustomSport.Badminton:
            case CustomSport.Squash:
            case CustomSport.TableTennis:
            case CustomSport.Tennis:
            case CustomSport.Padel:
            case CustomSport.Volleyball:
            case CustomSport.Darts: {
                return 'sets';
            }
        }
        return '';
    }


    getScoreDirection(direction: number): string {
        switch (direction) {
            case ScoreConfig.UPWARDS: { return 'naar'; }
            case ScoreConfig.DOWNWARDS: { return 'vanaf'; }
        }
        return '';
    }

    getFieldNameSingular(sport?: Sport): string {
        const customId = sport ? sport.getCustomId() : 0;
        switch (customId) {
            case CustomSport.Darts:
            case CustomSport.Chess:
                {
                    return 'bord';
                }
            case CustomSport.Badminton:
            case CustomSport.Squash:
            case CustomSport.Tennis:
            case CustomSport.Padel:
                {
                    return 'baan';
                }
            case CustomSport.TableTennis:
            case CustomSport.Jass:
                {
                    return 'tafel';
                }
            case CustomSport.Shuffleboard:
                {
                    return 'bak';
                }
        }
        return 'veld';
    }

    getFieldNamePlural(sport?: Sport): string {
        const single = this.getFieldNameSingular(sport);
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
