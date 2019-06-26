import { TSport } from './tsport';
import {
    SportScoreConfig
} from 'ngx-sport';

export class Translate {
    static readonly data = {
        'nl': {
            'sport': [
                TSport.Badminton: 'badminton',
                TSport.Basketball: 'basketbal',
                TSport.Darts: 'darten',
                TSport.ESports: 'e-sporten',
                TSport.Hockey: 'hockey',
                TSport.Korfball: 'korfbal',
                TSport.Chess: 'schaken',
                TSport.Squash: 'squash',
                TSport.TableTennis: 'tafeltennis',
                TSport.Tennis: 'hockey',
                TSport.Football: 'voetbal',
                TSport.Volleyball: 'volleybal'
            ],
            'score': {
                TSport.Badminton: 'sets',
                TSport.Basketball: 'punten',
                TSport.Darts: 'sets',
                TSport.ESports: 'punten',
                TSport.Hockey: 'goals',
                TSport.Korfball: 'punten',
                TSport.Chess: 'punten',
                TSport.Squash: 'sets',
                TSport.TableTennis: 'sets',
                TSport.Tennis: 'sets',
                TSport.Football: 'goals',
                TSport.Volleyball: 'sets'
            },
            'scoresub': {
                TSport.Darts: 'legs',
                TSport.Tennis: 'games',
            },
            'scoresingle': {
                TSport.Badminton: 'set',
                TSport.Basketball: 'punt',
                TSport.Darts: 'set',
                TSport.ESports: 'punt',
                TSport.Hockey: 'goal',
                TSport.Korfball: 'punt',
                TSport.Chess: 'punt',
                TSport.Squash: 'set',
                TSport.TableTennis: 'set',
                TSport.Tennis: 'set',
                TSport.Football: 'goal',
                TSport.Volleyball: 'set'
            },
            'scoresinglesub': {
                TSport.Darts: 'leg',
                TSport.Tennis: 'game',
            },
            'scoredirection': {
                SportScoreConfig.UPWARDS: 'naar',
                SportScoreConfig.DOWNWARDS: 'vanaf'
            }
        }
    };

    static getSport( language: string, customId: number ): string {
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
