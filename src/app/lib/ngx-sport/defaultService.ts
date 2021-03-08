import { Injectable } from "@angular/core";
import { CreationStrategy, GameMode, JsonPlanningConfig, JsonSport, PouleStructure, RankingRuleSet, SelfReferee, Sport } from "ngx-sport";
import { SportService } from "./sport/service";
@Injectable({
    providedIn: 'root'
})
export class DefaultService {
    static readonly MinutesPerGame: number = 20;
    static readonly MinutesPerGameExt: number = 5;
    static readonly MinutesBetweenGames: number = 5;
    static readonly MinutesAfter: number = 5;
    static readonly RankingRuleSet: RankingRuleSet = RankingRuleSet.Against;

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
            creationStrategy: this.getDefaultGameCreationStrategy(sports),
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
        const maxNrOfGamePlaces = this.sportService.getMaxNrOfGamePlaces(sports);
        if (maxNrOfGamePlaces === 0) {
            return 10;
        }
        let nrOfPlaces = maxNrOfGamePlaces * nrOfFields * 2;
        return nrOfPlaces < 5 ? 5 : nrOfPlaces;
    }

    /**
     * Bij aanmaken toernooi, moet je bij sport.getGameMode() === Against, 
     * kunnen kiezen voor een laddertoernooi. Dit houdt dan in 
     * CreationStrategy.incrementalRanking
     * 
     * @param sports 
     */
    protected getDefaultGameCreationStrategy(sports: Sport[]): CreationStrategy {
        // muliply
        if (sports.length > 1) {
            return CreationStrategy.staticManual;
        }
        const sport: Sport = sports[0];
        if (sport.getGameMode() === GameMode.Together) {
            return CreationStrategy.staticManual;

        }
        if (sport.getNrOfGamePlaces() > 2) {
            return CreationStrategy.incrementalRandom;
        }

        return CreationStrategy.staticPouleSize
    }

    protected hasGameMode(sports: Sport[], gameMode: GameMode): boolean {
        return sports.some((sport: Sport) => sport.getGameMode() === gameMode);
    }
}