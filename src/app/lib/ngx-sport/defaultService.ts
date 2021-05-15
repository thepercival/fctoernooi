import { Injectable } from "@angular/core";
import { AgainstSportVariant, AllInOneGameSportVariant, CompetitionSportService, GameMode, JsonPlanningConfig, JsonSport, PouleStructure, RankingRuleSet, SelfReferee, SingleSportVariant, Sport, VoetbalRange } from "ngx-sport";

@Injectable({
    providedIn: 'root'
})
export class DefaultService {
    static readonly MinutesPerGame: number = 20;
    static readonly MinutesPerGameExt: number = 5;
    static readonly MinutesBetweenGames: number = 5;
    static readonly MinutesAfter: number = 5;
    static readonly RankingRuleSet: RankingRuleSet = RankingRuleSet.Against;

    constructor(private competitionService: CompetitionSportService) {
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
                sport.getDefaultNrOfSidePlaces() > 1 ? 0 : 1,
                sport.getDefaultNrOfSidePlaces() > 1 ? 1 : 0);
        } else if (sport.getDefaultGameMode() === GameMode.Single) {
            return new SingleSportVariant(sport, 1, 1);
        }
        return new AllInOneGameSportVariant(sport, 1);
    }

    getJsonPlanningConfig(sportVariants: (SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant)[]): JsonPlanningConfig {
        return {
            id: 0,
            extension: false,
            enableTime: true,
            minutesPerGame: DefaultService.MinutesPerGame,
            minutesPerGameExt: 0,
            minutesBetweenGames: DefaultService.MinutesBetweenGames,
            minutesAfter: DefaultService.MinutesAfter,
            selfReferee: SelfReferee.Disabled
        }
    }

    getPouleStructure(sportVariants: (SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant)[]): PouleStructure {
        let nrOfPlaces = this.competitionService.getMinNrOfPlacesPerPoule(sportVariants);
        if (nrOfPlaces < 5) {
            nrOfPlaces = 5;
        }
        return new PouleStructure(nrOfPlaces);
    }

    getGameAmountRange(sportVariant: SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant | GameMode): VoetbalRange {
        if (sportVariant instanceof AgainstSportVariant && !sportVariant.isMixed()) {
            return { min: 1, max: 4 };
        }
        return { min: 1, max: 50 };
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