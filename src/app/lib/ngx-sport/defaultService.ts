import { Injectable } from "@angular/core";
import { AgainstSportVariant, AllInOneGameSportVariant, CreationStrategy, GameMode, JsonPlanningConfig, JsonSport, PouleStructure, RankingRuleSet, SelfReferee, SingleSportVariant, Sport, VoetbalRange } from "ngx-sport";
import { SportWithFields } from "../../admin/sport/createSportWithFields.component";

@Injectable({
    providedIn: 'root'
})
export class DefaultService {
    static readonly MinutesPerGame: number = 20;
    static readonly MinutesPerGameExt: number = 5;
    static readonly MinutesBetweenGames: number = 5;
    static readonly MinutesAfter: number = 5;
    static readonly RankingRuleSet: RankingRuleSet = RankingRuleSet.Against;

    constructor() {
    }

    getJsonSport(name: string): JsonSport {
        return {
            id: 0,
            name: name,
            team: false,
            defaultGameMode: GameMode.Against,
            defaultNrOfSidePlaces: 1,
            customId: 0
        };
    }

    public getSportVariant(sport: Sport): SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant {
        if (sport.getDefaultGameMode() === GameMode.Against) {
            return new AgainstSportVariant(
                sport,
                sport.getDefaultNrOfSidePlaces(),
                sport.getDefaultNrOfSidePlaces(),
                1);
        } else if (sport.getDefaultGameMode() === GameMode.Single) {
            return new SingleSportVariant(sport, 1, 1);
        }
        return new AllInOneGameSportVariant(sport, 1);
    }

    getJsonPlanningConfig(sportVariants: (SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant)[]): JsonPlanningConfig {
        return {
            id: 0,
            creationStrategy: this.getGameCreationStrategy(sportVariants),
            extension: false,
            enableTime: true,
            minutesPerGame: DefaultService.MinutesPerGame,
            minutesPerGameExt: 0,
            minutesBetweenGames: DefaultService.MinutesBetweenGames,
            minutesAfter: DefaultService.MinutesAfter,
            selfReferee: SelfReferee.Disabled
        }
    }

    getPouleStructure(sportsWithFields: SportWithFields[]): PouleStructure {
        return new PouleStructure(5);
    }

    /**
     * Bij aanmaken toernooi, moet je bij sport.getGameMode() === Against, 
     * kunnen kiezen voor een laddertoernooi. Dit houdt dan in 
     * CreationStrategy.incrementalRanking
     * 
     * @param sports 
     */
    protected getGameCreationStrategy(sportVariants: (SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant)[]): CreationStrategy {
        // als er gemixed
        // // muliply
        if (sportVariants.length > 1) {
            return CreationStrategy.StaticManual;
        }
        const sportVariant = sportVariants[0];
        if (sportVariant instanceof SingleSportVariant) {
            return CreationStrategy.StaticManual;
        }
        if (sportVariant instanceof AgainstSportVariant && sportVariant.getNrOfGamePlaces() > 2) {
            return CreationStrategy.IncrementalRandom;
        }
        return CreationStrategy.StaticPouleSize
    }

    // protected hasGameMode(sports: Sport[], gameMode: GameMode): boolean {
    //     return sports.some((sport: Sport) => sport.getGameMode() === gameMode);
    // }

    getGameAmountConfigValidations(): GameAmountConfigValidations {
        return {
            nrOfH2HRange: { min: 1, max: 4 },
            gameAmountRange: { min: 1, max: 50 }
        }
    };

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

export interface GameAmountConfigValidations {
    nrOfH2HRange: VoetbalRange;
    gameAmountRange: VoetbalRange;
}