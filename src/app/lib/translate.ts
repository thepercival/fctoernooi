import { Sport, SportCustom, SportScoreConfig } from 'ngx-sport';

export class TranslateService {
    static readonly language = 'nl';

    getSportName(customId: number): string {
        switch (customId) {
            case SportCustom.Badminton: { return 'badminton'; }
            case SportCustom.Basketball: { return 'basketbal'; }
            case SportCustom.Darts: { return 'darten'; }
            case SportCustom.ESports: { return 'e-sporten'; }
            case SportCustom.Hockey: { return 'hockey'; }
            case SportCustom.Baseball: { return 'honkbal'; }
            case SportCustom.Korfball: { return 'korfbal'; }
            case SportCustom.Chess: { return 'schaken'; }
            case SportCustom.Squash: { return 'squash'; }
            case SportCustom.TableTennis: { return 'tafeltennis'; }
            case SportCustom.Tennis: { return 'tennis'; }
            case SportCustom.Football: { return 'voetbal'; }
            case SportCustom.Volleyball: { return 'volleybal'; }
            case SportCustom.IceHockey: { return 'ijshockey'; }
        }
        return undefined;
    }

    getScoreNameSingular(sportScoreConfig: SportScoreConfig): string {
        const customId = sportScoreConfig.getSport().getCustomId();
        if (sportScoreConfig.isFirst()) {
            return this.getFirstScoreNameSingular(customId);
        } else if (sportScoreConfig.isLast()) {
            return this.getLastScoreNameSingular(customId);
        }
        return '';
    }

    protected getFirstScoreNameSingular(customId: number): string {
        switch (customId) {
            case SportCustom.Darts: { return 'leg'; }
            case SportCustom.Tennis: { return 'game'; }
            case SportCustom.Football:
            case SportCustom.Hockey: {
                return 'goal';
            }
        }
        return 'punt';
    }

    protected getLastScoreNameSingular(customId: number): string {
        switch (customId) {
            case SportCustom.Badminton:
            case SportCustom.Squash:
            case SportCustom.TableTennis:
            case SportCustom.Volleyball:
            case SportCustom.Darts:
            case SportCustom.Tennis: {
                return 'set';
            }
        }
        return '';
    }

    getScoreNamePlural(sportScoreConfig: SportScoreConfig): string {
        const customId = sportScoreConfig.getSport().getCustomId();
        if (sportScoreConfig.isFirst()) {
            return this.getFirstScoreNamePlural(customId);
        } else if (sportScoreConfig.isLast()) {
            return this.getLastScoreNamePlural(customId);
        }
        return '';
    }

    protected getFirstScoreNamePlural(customId: number): string {
        switch (customId) {
            case SportCustom.Darts: { return 'legs'; }
            case SportCustom.Tennis: { return 'games'; }
            case SportCustom.Football:
            case SportCustom.Hockey: {
                return 'goals';
            }
        }
        return 'punten';
    }

    protected getLastScoreNamePlural(customId: number): string {
        switch (customId) {
            case SportCustom.Badminton:
            case SportCustom.Squash:
            case SportCustom.TableTennis:
            case SportCustom.Volleyball:
            case SportCustom.Darts:
            case SportCustom.Tennis: {
                return 'sets';
            }
        }
        return '';
    }


    getScoreDirection(direction: number): string {
        switch (direction) {
            case SportScoreConfig.UPWARDS: { return 'naar'; }
            case SportScoreConfig.DOWNWARDS: { return 'vanaf'; }
        }
        return undefined;
    }

    getFieldNameSingular(sport?: Sport): string {
        const customId = sport ? sport.getCustomId() : undefined;
        switch (customId) {
            case SportCustom.Badminton: { return 'veld'; }
            case SportCustom.Basketball: { return 'veld'; }
            case SportCustom.Darts: { return 'bord'; }
            case SportCustom.ESports: { return 'veld'; }
            case SportCustom.Hockey: { return 'veld'; }
            case SportCustom.Baseball: { return 'veld'; }
            case SportCustom.Korfball: { return 'veld'; }
            case SportCustom.Chess: { return 'bord'; }
            case SportCustom.Squash: { return 'baan'; }
            case SportCustom.TableTennis: { return 'tafel'; }
            case SportCustom.Tennis: { return 'veld'; }
            case SportCustom.Football: { return 'veld'; }
            case SportCustom.Volleyball: { return 'veld'; }
            case SportCustom.IceHockey: { return 'veld'; }
        }
        return 'veld';
    }

    getFieldNamePlural(sport?: Sport): string {
        const customId = sport ? sport.getCustomId() : undefined;
        switch (customId) {
            case SportCustom.Badminton: { return 'velden'; }
            case SportCustom.Basketball: { return 'velden'; }
            case SportCustom.Darts: { return 'borden'; }
            case SportCustom.ESports: { return 'velden'; }
            case SportCustom.Hockey: { return 'velden'; }
            case SportCustom.Baseball: { return 'velden'; }
            case SportCustom.Korfball: { return 'velden'; }
            case SportCustom.Chess: { return 'borden'; }
            case SportCustom.Squash: { return 'banen'; }
            case SportCustom.TableTennis: { return 'tafels'; }
            case SportCustom.Tennis: { return 'velden'; }
            case SportCustom.Football: { return 'velden'; }
            case SportCustom.Volleyball: { return 'velden'; }
            case SportCustom.IceHockey: { return 'velden'; }
        }
        return 'velden';
    }
}
