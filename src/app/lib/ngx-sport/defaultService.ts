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
    protected getGameCreationStrategy(sports: Sport[]): CreationStrategy {
        // muliply
        if (sports.length > 1) {
            return CreationStrategy.StaticManual;
        }
        const sport: Sport = sports[0];
        if (sport.getGameMode() === GameMode.Together) {
            return CreationStrategy.StaticManual;

        }
        if (sport.getNrOfGamePlaces() > 2) {
            return CreationStrategy.IncrementalRandom;
        }

        return CreationStrategy.StaticPouleSize
    }

    protected hasGameMode(sports: Sport[], gameMode: GameMode): boolean {
        return sports.some((sport: Sport) => sport.getGameMode() === gameMode);
    }

    getNrOfPoules(nrOfPlaces: number): number {
        switch (nrOfPlaces) {
            case 2:
            case 3:
            case 4:
            case 5:
            case 7: {
                return 1;
            }
            case 6:
            case 8:
            case 10:
            case 11: {
                return 2;
            }
            case 9:
            case 12:
            case 13:
            case 14:
            case 15: {
                return 3;
            }
            case 16:
            case 17:
            case 18:
            case 19: {
                return 4;
            }
            case 20:
            case 21:
            case 22:
            case 23:
            case 25: {
                return 5;
            }
            case 24:
            case 26:
            case 29:
            case 30:
            case 33:
            case 34:
            case 36: {
                return 6;
            }
            case 28:
            case 31:
            case 35:
            case 37:
            case 38:
            case 39: {
                return 7;
            }
            case 27: {
                return 9;
            }
        }
        return 8;
    }
}