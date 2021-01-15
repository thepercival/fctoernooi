import { Injectable } from "@angular/core";
import { GameMode, JsonCompetitionSport, JsonField, JsonPlanningConfig, RankingRuleSet, SelfReferee, Sport, SportMapper } from "ngx-sport";
@Injectable()
export class SportDefaultService {
    static readonly MinutesPerGame: number = 20;
    static readonly MinutesPerGameExt: number = 5;
    static readonly MinutesBetweenGames: number = 5;
    static readonly MinutesAfter: number = 5;
    static readonly RankingRuleSet: RankingRuleSet = RankingRuleSet.WC

    constructor(
        private sportMapper: SportMapper) {
    }

    getJsonCompetitionSport(sport: Sport, nrOfFields: number): JsonCompetitionSport {
        const fields: JsonField[] = [];
        for (let priority = 1; priority <= nrOfFields; priority++) {
            fields.push({ id: priority, priority, name: String(priority) });
        }
        return {
            id: 0,
            sport: this.sportMapper.toJson(sport),
            fields
        }
    }

    getJsonPlanningConfig(gameMode: GameMode): JsonPlanningConfig {
        return {
            id: 0,
            gameMode: gameMode,
            extension: false,
            enableTime: true,
            minutesPerGame: SportDefaultService.MinutesPerGameExt,
            minutesPerGameExt: SportDefaultService.MinutesPerGame,
            minutesBetweenGames: SportDefaultService.MinutesBetweenGames,
            minutesAfter: SportDefaultService.MinutesAfter,
            selfReferee: SelfReferee.Disabled
        }
    }
}