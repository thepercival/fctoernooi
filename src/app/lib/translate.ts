import { SportCustom, SportScoreConfig } from 'ngx-sport';

export class TranslateService {
    static readonly language = 'nl';

    static readonly data = {
        'nl': {
            'score': {
                // SportCustom.Badminton: 'sets',
                // SportCustom.Basketball: 'punten',
                // SportCustom.Darts: 'sets',
                // SportCustom.ESports: 'punten',
                // SportCustom.Hockey: 'goals',
                // SportCustom.Korfball: 'punten',
                // SportCustom.Chess: 'punten',
                // SportCustom.Squash: 'sets',
                // SportCustom.TableTennis: 'sets',
                // SportCustom.Tennis: 'sets',
                // SportCustom.Football: 'goals',
                // SportCustom.Volleyball: 'sets'
            },
            'scoresub': {
                // SportCustom.Darts: 'legs',
                // SportCustom.Tennis: 'games',
            },

            'scoredirection': {
                // SportScoreConfig.UPWARDS: 'naar',
                // SportScoreConfig.DOWNWARDS: 'vanaf'
            }
        }
    };

    getSportName(language: string, customId: number): string {
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
            case SportCustom.Tennis: { return 'darten'; }
            case SportCustom.Football: { return 'voetbal'; }
            case SportCustom.Voleyball: { return 'volleybal'; }
            case SportCustom.Baseball: { return 'honkbal'; }
        }
        return undefined;
    }

    static getScore(language: string, sportScoreConfig: SportScoreConfig): string {
        const id = sportScoreConfig.getParent() === undefined ? 'score' : 'scoresub';
        return this.data[language][id][sportScoreConfig.getSport().getCustomId()];
    }

    getScoreSingleName(language: string, sportScoreConfig: SportScoreConfig): string {
        const customId = sportScoreConfig.getSport().getCustomId();
        if (sportScoreConfig.getParent() !== undefined) {
            return this.getScoreSubSingleName(language, customId);
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

    protected getScoreSubSingleName(language: string, customId: number): string {
        switch (customId) {
            case SportCustom.Darts: { return 'leg'; }
            case SportCustom.Tennis: { return 'game'; }
        }
        return undefined;

    }


    static getScoreDirection(language: string, direction: number): string {
        return this.data[language]['scoredirection'][direction];
    }
}
