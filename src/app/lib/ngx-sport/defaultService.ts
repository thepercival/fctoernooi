import { Injectable } from "@angular/core";
import { GameMode, JsonPlanningConfig, JsonSport, RankingRuleSet, SelfReferee } from "ngx-sport";
@Injectable({
    providedIn: 'root'
})
export class SportDefaultService {
    static readonly MinutesPerGame: number = 20;
    static readonly MinutesPerGameExt: number = 5;
    static readonly MinutesBetweenGames: number = 5;
    static readonly MinutesAfter: number = 5;
    static readonly RankingRuleSet: RankingRuleSet = RankingRuleSet.WC;

    constructor() {
    }

    getJsonSport(): JsonSport {
        return {
            id: 0,
            name: '',
            team: false,
            gameMode: GameMode.Against,
            nrOfGamePlaces: 2,
            customId: undefined
        };
    }

    getJsonPlanningConfig(gameMode: GameMode): JsonPlanningConfig {
        return {
            id: 0,
            gameMode: gameMode,
            extension: false,
            enableTime: true,
            minutesPerGame: SportDefaultService.MinutesPerGame,
            minutesPerGameExt: 0,
            minutesBetweenGames: SportDefaultService.MinutesBetweenGames,
            minutesAfter: SportDefaultService.MinutesAfter,
            selfReferee: SelfReferee.Disabled
        }
    }
}