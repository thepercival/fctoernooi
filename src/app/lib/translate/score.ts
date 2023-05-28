import { Injectable } from '@angular/core';
import { ScoreConfig, ScoreDirection } from 'ngx-sport';
import { CustomSportId } from '../ngx-sport/sport/custom';

@Injectable({
    providedIn: 'root'
})
export class TranslateScoreService {
    static readonly language = 'nl';

   

    getScoreNameSingular(scoreConfig: ScoreConfig): string {
        const customId = scoreConfig.getCompetitionSport().getSport().getCustomId();
        if (scoreConfig.isFirst()) {
            return this.getFirstScoreNameSingular(scoreConfig);
        }
        return this.getLastScoreNameSingular(customId);
    }

    protected getFirstScoreNameSingular(scoreConfig: ScoreConfig): string {
        const customSportId = scoreConfig.getCompetitionSport().getSport().getCustomId();
        switch (customSportId) {
            case CustomSportId.Darts: { return 'leg'; }
            case CustomSportId.Tennis:
            case CustomSportId.Padel: {
                return 'game';
            }
            case CustomSportId.Football:
            case CustomSportId.Hockey: {
                return 'goal';
            }
        }
        return 'punt';
    }

    protected getLastScoreNameSingular(customSportId: CustomSportId): string {
        switch (customSportId) {
            case CustomSportId.Jass: {
                return 'boom';
            }
            case CustomSportId.Badminton:
            case CustomSportId.Squash:
            case CustomSportId.TableTennis:
            case CustomSportId.Tennis:
            case CustomSportId.Padel:
            case CustomSportId.Volleyball:
            case CustomSportId.Darts: {
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

    protected getFirstScoreNamePlural(customSportId: CustomSportId): string {
        switch (customSportId) {
            case CustomSportId.Darts: { return 'legs'; }
            case CustomSportId.Tennis:{
                return 'games';
            }
            case CustomSportId.Football:
            case CustomSportId.Hockey: {
                return 'goals';
            }
        }
        return 'punten';
    }

    protected getLastScoreNamePlural(customId: CustomSportId): string {
        switch (customId) {
            case CustomSportId.Jass: {
                return 'bomen';
            }
            case CustomSportId.Badminton:
            case CustomSportId.Squash:
            case CustomSportId.TableTennis:
            case CustomSportId.Tennis:
            case CustomSportId.Padel:
            case CustomSportId.Volleyball:
            case CustomSportId.Darts: {
                return 'sets';
            }
        }
        return '';
    }


    getScoreDirection(direction: ScoreDirection): string {
        switch (direction) {
            case ScoreDirection.Upwards: { return 'naar'; }
            case ScoreDirection.DownWards: { return 'vanaf'; }
        }
        return '';
    }
}
