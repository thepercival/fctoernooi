import { Sport, SportCustom, ScoreConfig, JsonScoreConfig } from 'ngx-sport';

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
            case SportCustom.Sjoelen: { return 'sjoelen'; }
            case SportCustom.Klaverjassen: { return 'klaverjassen'; }
        }
        return undefined;
    }

    getScoreNameSingular(jsonScoreConfig: JsonScoreConfig): string {
        const customId = jsonScoreConfig.competitionSport.sport.customId;
        if (jsonScoreConfig.isFirst) {
            return this.getFirstScoreNameSingular(customId);
        }
        return this.getLastScoreNameSingular(customId);
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

    getScoreNamePlural(jsonScoreConfig: JsonScoreConfig): string {
        const customId = jsonScoreConfig.competitionSport.sport.customId;
        if (jsonScoreConfig.isFirst) {
            return this.getFirstScoreNamePlural(customId);
        }
        return this.getLastScoreNamePlural(customId);
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
            case ScoreConfig.UPWARDS: { return 'naar'; }
            case ScoreConfig.DOWNWARDS: { return 'vanaf'; }
        }
        return undefined;
    }

    getFieldNameSingular(sport?: Sport): string {
        const customId = sport ? sport.getCustomId() : undefined;
        switch (customId) {
            case SportCustom.Darts:
            case SportCustom.Chess:
                {
                    return 'bord';
                }
            case SportCustom.Squash:
            case SportCustom.Tennis:
                {
                    return 'baan';
                }
            case SportCustom.TableTennis:
            case SportCustom.Klaverjassen:
                {
                    return 'tafel';
                }
            case SportCustom.Sjoelen:
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
