import { SportScoreConfig } from 'ngx-sport';

export class Translate {
    static readonly data = {
        'nl': {
            'sport': {
            },
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
            'scoresingle': {
                // SportCustom.Badminton: 'set',
                // SportCustom.Basketball: 'punt',
                // SportCustom.Darts: 'set',
                // SportCustom..ESports: 'punt',
                // SportCustom.Hockey: 'goal',
                // SportCustom.Korfball: 'punt',
                // SportCustom.Chess: 'punt',
                // SportCustom.Squash: 'set',
                // SportCustom.TableTennis: 'set',
                // SportCustom.Tennis: 'set',
                // SportCustom.Football: 'goal',
                // SportCustom.Volleyball: 'set'
            },
            'scoresinglesub': {
                // SportCustom.Darts: 'leg',
                // SportCustom.Tennis: 'game',
            },
            'scoredirection': {
                // SportScoreConfig.UPWARDS: 'naar',
                // SportScoreConfig.DOWNWARDS: 'vanaf'
            }
        }
    };

    // this.data['nl']['sport'][SportCustom.Badminton] = 'badminton';

    // SportCustom.Basketball: 'basketbal',
    // SportCustom.Darts: 'darten',
    // SportCustom.ESports: 'e-sporten',
    // SportCustom.Hockey: 'hockey',
    // SportCustom.Korfball: 'korfbal',
    // SportCustom.Chess: 'schaken',
    // SportCustom.Squash: 'squash',
    // SportCustom.TableTennis: 'tafeltennis',
    // SportCustom.Tennis: 'hockey',
    // SportCustom.Football: 'voetbal',
    // SportCustom.Volleyball: 'volleybal'

    static geSportCustomId(language: string, customId: number): string {
        return this.data[language]['sport'][customId];
    }

    static getScore(language: string, sportScoreConfig: SportScoreConfig): string {
        const id = sportScoreConfig.getParent() === undefined ? 'score' : 'scoresub';
        return this.data[language][id][sportScoreConfig.getSport().getCustomId()];
    }

    static getScoreSingle(language: string, sportScoreConfig: SportScoreConfig): string {
        const id = sportScoreConfig.getParent() === undefined ? 'scoresingle' : 'scoresinglesub';
        return this.data[language][id][sportScoreConfig.getSport().getCustomId()];
    }

    static getScoreDirection(language: string, direction: number): string {
        return this.data[language]['scoredirection'][direction];
    }
}
