import { Injectable } from "@angular/core";
import { GameMode, JsonPlanningConfig, JsonSport, PouleStructure, RankingRuleSet, SelfReferee, Sport } from "ngx-sport";
import { SportService } from "./sport/service";
@Injectable({
    providedIn: 'root'
})
export class DefaultService {
    static readonly MinutesPerGame: number = 20;
    static readonly MinutesPerGameExt: number = 5;
    static readonly MinutesBetweenGames: number = 5;
    static readonly MinutesAfter: number = 5;
    static readonly RankingRuleSet: RankingRuleSet = RankingRuleSet.WC;

    constructor(private sportService: SportService) {
    }

    getJsonSport(): JsonSport {
        return {
            id: 0,
            name: '',
            team: false,
            gameMode: GameMode.Against,
            nrOfGamePlaces: 2,
            customId: 0
        };
    }

    getJsonPlanningConfig(sports: Sport[]): JsonPlanningConfig {
        return {
            id: 0,
            gameMode: this.getDefaultGameMode(sports),
            extension: false,
            enableTime: true,
            minutesPerGame: DefaultService.MinutesPerGame,
            minutesPerGameExt: 0,
            minutesBetweenGames: DefaultService.MinutesBetweenGames,
            minutesAfter: DefaultService.MinutesAfter,
            selfReferee: SelfReferee.Disabled
        }
    }

    getPouleStructure(sports: Sport[], nrOfFields: number): PouleStructure {
        return new PouleStructure(this.getNrOfPlaces(sports, nrOfFields));
    }

    private getNrOfPlaces(sports: Sport[], nrOfFields: number): GameMode {
        const gameMode = this.getDefaultGameMode(sports);
        if (gameMode === GameMode.Against) {
            return 5;
        }
        let nrOfPlaces = this.sportService.getMaxNrOfGamePlaces(sports) * nrOfFields;
        return nrOfPlaces < 5 ? 5 : nrOfPlaces;
    }

    getDefaultGameMode(sports: Sport[]): GameMode {
        const hasTogether = this.hasGameMode(sports, GameMode.Together);
        return hasTogether ? GameMode.Together : GameMode.Against;
    }

    protected hasGameMode(sports: Sport[], gameMode: GameMode): boolean {
        return sports.some((sport: Sport) => sport.getGameMode() === gameMode);
    }
}