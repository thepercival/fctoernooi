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
            case SportCustom.Korfball: { return 'korfbal'; }
            case SportCustom.Chess: { return 'schaken'; }
            case SportCustom.Squash: { return 'squash'; }
            case SportCustom.TableTennis: { return 'tafeltennis'; }
            case SportCustom.Tennis: { return 'tennis'; }
            case SportCustom.Football: { return 'voetbal'; }
            case SportCustom.Voleyball: { return 'volleybal'; }
            case SportCustom.Baseball: { return 'honkbal'; }
        }
        return undefined;
    }

    getScoreNameSingle(sportScoreConfig: SportScoreConfig): string {
        const customId = sportScoreConfig.getSport().getCustomId();
        if (sportScoreConfig.getPrevious() !== undefined) {
            return this.getScoreSubSingleName(customId);
        }
        switch (customId) {
            case SportCustom.Badminton: { return 'set'; }
            case SportCustom.Basketball: { return 'punt'; }
            case SportCustom.Darts: { return 'set'; }
            case SportCustom.ESports: { return 'punt'; }
            case SportCustom.Hockey: { return 'goal'; }
            case SportCustom.Korfball: { return 'punt'; }
            case SportCustom.Chess: { return 'punt'; }
            case SportCustom.Squash: { return 'set'; }
            case SportCustom.TableTennis: { return 'set'; }
            case SportCustom.Tennis: { return 'set'; }
            case SportCustom.Football: { return 'goal'; }
            case SportCustom.Voleyball: { return 'set'; }
            case SportCustom.Baseball: { return 'punt'; }
        }
        return undefined;
    }

    protected getScoreSubSingleName(customId: number): string {
        switch (customId) {
            case SportCustom.Darts: { return 'leg'; }
            case SportCustom.Tennis: { return 'game'; }
        }
        return undefined;
    }

    getScoreNameMultiple(sportScoreConfig: SportScoreConfig): string {
        const customId = sportScoreConfig.getSport().getCustomId();
        if (sportScoreConfig.getPrevious() !== undefined) {
            return this.getScoreSubSingleName(customId);
        }
        switch (customId) {
            case SportCustom.Badminton: { return 'sets'; }
            case SportCustom.Basketball: { return 'punten'; }
            case SportCustom.Darts: { return 'sets'; }
            case SportCustom.ESports: { return 'punten'; }
            case SportCustom.Hockey: { return 'goals'; }
            case SportCustom.Korfball: { return 'punten'; }
            case SportCustom.Chess: { return 'punten'; }
            case SportCustom.Squash: { return 'sets'; }
            case SportCustom.TableTennis: { return 'sets'; }
            case SportCustom.Tennis: { return 'sets'; }
            case SportCustom.Football: { return 'goals'; }
            case SportCustom.Voleyball: { return 'sets'; }
            case SportCustom.Baseball: { return 'punten'; }
        }
        return undefined;
    }

    protected getScoreSubNameMultiple(customId: number): string {
        switch (customId) {
            case SportCustom.Darts: { return 'legs'; }
            case SportCustom.Tennis: { return 'games'; }
        }
        return undefined;
    }


    getScoreDirection(direction: number): string {
        switch (direction) {
            case SportScoreConfig.UPWARDS: { return 'naar'; }
            case SportScoreConfig.DOWNWARDS: { return 'vanaf'; }
        }
        return undefined;
    }

    getFieldName(sport?: Sport): string {
        const customId = sport ? sport.getCustomId() : undefined;
        switch (customId) {
            case SportCustom.Badminton: { return 'veld'; }
            case SportCustom.Basketball: { return 'veld'; }
            case SportCustom.Darts: { return 'bord'; }
            case SportCustom.ESports: { return 'veld'; }
            case SportCustom.Hockey: { return 'veld'; }
            case SportCustom.Korfball: { return 'veld'; }
            case SportCustom.Chess: { return 'bord'; }
            case SportCustom.Squash: { return 'baan'; }
            case SportCustom.TableTennis: { return 'tafel'; }
            case SportCustom.Tennis: { return 'veld'; }
            case SportCustom.Football: { return 'veld'; }
            case SportCustom.Voleyball: { return 'veld'; }
            case SportCustom.Baseball: { return 'veld'; }
        }
        return 'veld';
    }

    getFieldsName(sport?: Sport): string {
        const customId = sport ? sport.getCustomId() : undefined;
        switch (customId) {
            case SportCustom.Badminton: { return 'velden'; }
            case SportCustom.Basketball: { return 'velden'; }
            case SportCustom.Darts: { return 'borden'; }
            case SportCustom.ESports: { return 'velden'; }
            case SportCustom.Hockey: { return 'velden'; }
            case SportCustom.Korfball: { return 'velden'; }
            case SportCustom.Chess: { return 'borden'; }
            case SportCustom.Squash: { return 'banen'; }
            case SportCustom.TableTennis: { return 'tafels'; }
            case SportCustom.Tennis: { return 'velden'; }
            case SportCustom.Football: { return 'velden'; }
            case SportCustom.Voleyball: { return 'velden'; }
            case SportCustom.Baseball: { return 'velden'; }
        }
        return 'velden';
    }
}
