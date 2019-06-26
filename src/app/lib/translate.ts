import { SportCustomId } from 'ngx-sport';
import {
    SportScoreConfig
} from 'ngx-sport';

export class Translate {
    static readonly data = {
        'nl': {
            'sport': {
            },
            'score': {
                // SportCustomId.Badminton: 'sets',
                // SportCustomId.Basketball: 'punten',
                // SportCustomId.Darts: 'sets',
                // SportCustomId.ESports: 'punten',
                // SportCustomId.Hockey: 'goals',
                // SportCustomId.Korfball: 'punten',
                // SportCustomId.Chess: 'punten',
                // SportCustomId.Squash: 'sets',
                // SportCustomId.TableTennis: 'sets',
                // SportCustomId.Tennis: 'sets',
                // SportCustomId.Football: 'goals',
                // SportCustomId.Volleyball: 'sets'
            },
            'scoresub': {
                // SportCustomId.Darts: 'legs',
                // SportCustomId.Tennis: 'games',
            },
            'scoresingle': {
                // SportCustomId.Badminton: 'set',
                // SportCustomId.Basketball: 'punt',
                // SportCustomId.Darts: 'set',
                // SportCustomId.ESports: 'punt',
                // SportCustomId.Hockey: 'goal',
                // SportCustomId.Korfball: 'punt',
                // SportCustomId.Chess: 'punt',
                // SportCustomId.Squash: 'set',
                // SportCustomId.TableTennis: 'set',
                // SportCustomId.Tennis: 'set',
                // SportCustomId.Football: 'goal',
                // SportCustomId.Volleyball: 'set'
            },
            'scoresinglesub': {
                // SportCustomId.Darts: 'leg',
                // SportCustomId.Tennis: 'game',
            },
            'scoredirection': {
                // SportScoreConfig.UPWARDS: 'naar',
                // SportScoreConfig.DOWNWARDS: 'vanaf'
            }
        }
    };

    // this.data['nl']['sport'][SportCustomId.Badminton] = 'badminton';

                // SportCustomId.Basketball: 'basketbal',
                // SportCustomId.Darts: 'darten',
                // SportCustomId.ESports: 'e-sporten',
                // SportCustomId.Hockey: 'hockey',
                // SportCustomId.Korfball: 'korfbal',
                // SportCustomId.Chess: 'schaken',
                // SportCustomId.Squash: 'squash',
                // SportCustomId.TableTennis: 'tafeltennis',
                // SportCustomId.Tennis: 'hockey',
                // SportCustomId.Football: 'voetbal',
                // SportCustomId.Volleyball: 'volleybal'

    static geSportCustomId( language: string, customId: number ): string {
        return this.data[language]['sport'][customId];
    }

    static getScore( language: string, sportScoreConfig: SportScoreConfig ): string {
        const id = sportScoreConfig.getParent() === undefined ? 'score' : 'scoresub';
        return this.data[language][id][sportScoreConfig.getSport().getCustomId()];
    }

    static getScoreSingle( language: string, sportScoreConfig: SportScoreConfig ): string {
        const id = sportScoreConfig.getParent() === undefined ? 'scoresingle' : 'scoresinglesub';
        return this.data[language][id][sportScoreConfig.getSport().getCustomId()];
    }

    static getScoreDirection( language: string, direction: number ): string {
        return this.data[language]['scoredirection'][direction];
    }
}
