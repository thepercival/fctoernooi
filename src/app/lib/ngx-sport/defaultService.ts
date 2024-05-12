import { Injectable } from "@angular/core";
import { AgainstGpp, AgainstH2h, AgainstRuleSet, AllInOneGame, CompetitionSportGetter, GameMode, GamePlaceStrategy, JsonPlanningConfig, JsonSport, PlaceRanges, PlanningEditMode, PointsCalculation, PouleStructure, SelfReferee, Single, Sport, VoetbalRange } from "ngx-sport";
import { CustomSportId } from "./sport/custom";

@Injectable({
    providedIn: 'root'
})
export class DefaultService {

    static readonly MinutesPerGame: number = 20;
    static readonly MinutesPerGameExt: number = 5;
    static readonly MinutesBetweenGames: number = 5;
    static readonly MinutesAfter: number = 5;
    static readonly AgainstRuleSet: AgainstRuleSet = AgainstRuleSet.DiffFirst;

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

    hasNextScoreConfig(customId: CustomSportId): boolean {
        if (
            customId === CustomSportId.Badminton
            || customId === CustomSportId.Darts
            || customId === CustomSportId.Squash
            || customId === CustomSportId.TableTennis
            || customId === CustomSportId.Tennis
            || customId === CustomSportId.Volleyball
            || customId === CustomSportId.Padel
        ) {
            return true;

        }
        return false;
    }

    getWinPoints(customId: CustomSportId): number {
        if (customId === CustomSportId.Rugby) {
            return 4;
        }
        if (customId === CustomSportId.Chess) {
            return 1;
        }
        return 3;
    }

    getDrawPoints(customId: CustomSportId): number {
        if (customId === CustomSportId.Rugby) {
            return 2;
        }
        if (customId === CustomSportId.Chess) {
            return 0.5;
        }
        return 1;
    }

    getWinPointsExt(customId: CustomSportId): number {
        if (customId === CustomSportId.Chess) {
            return 1;
        }
        return 2;
    }

    getDrawPointsExt(customId: CustomSportId): number {
        if (customId === CustomSportId.Chess) {
            return 0.5;
        }
        return 1;
    }

    getLosePointsExt(customId: CustomSportId): number {
        if (customId === CustomSportId.IceHockey) {
            return 1;
        }
        return 0;
    }

    getJsonPlanningConfig(sportVariant: Single | AgainstH2h | AgainstGpp | AllInOneGame): JsonPlanningConfig {
        let gamePlaceStrategy = GamePlaceStrategy.EquallyAssigned;
        // if (sportVariant instanceof AgainstGpp && sportVariant.hasMultipleSidePlaces()) {
        //     gamePlaceStrategy = GamePlaceStrategy.RandomlyAssigned;
        // }
        return {
            id: 0,
            editMode: PlanningEditMode.Auto,
            gamePlaceStrategy: gamePlaceStrategy,
            extension: false,
            enableTime: true,
            minutesPerGame: DefaultService.MinutesPerGame,
            minutesPerGameExt: 0,
            minutesBetweenGames: DefaultService.MinutesBetweenGames,
            minutesAfter: DefaultService.MinutesAfter,
            perPoule: false,
            selfReferee: SelfReferee.Disabled,
            nrOfSimSelfRefs: 0,
            bestLast: false
        }
    }

    public getPlaceRanges(sportVariants: (Single | AgainstH2h | AgainstGpp | AllInOneGame)[]): PlaceRanges {
        const minNrOfPlacesPerPoule = (new CompetitionSportGetter()).getMinNrOfPlacesPerPoule(sportVariants);
        const maxNrOfPlacesPerPouleSmall = 20;
        const maxNrOfPlacesPerPouleLarge = 12;
        const minNrOfPlacesPerRound = minNrOfPlacesPerPoule;
        const maxNrOfPlacesPerRoundSmall = 40;
        const maxNrOfPlacesPerRoundLarge = 128;
        return new PlaceRanges(
            minNrOfPlacesPerPoule, maxNrOfPlacesPerPouleSmall, maxNrOfPlacesPerPouleLarge,
            minNrOfPlacesPerRound, maxNrOfPlacesPerRoundSmall, maxNrOfPlacesPerRoundLarge
        );
    }

    public getPouleStructure(sportVariants: (Single | AgainstH2h | AgainstGpp | AllInOneGame)[]): PouleStructure {
        let nrOfPlaces = (new CompetitionSportGetter()).getMinNrOfPlacesPerPoule(sportVariants);
        if (nrOfPlaces < 5) {
            nrOfPlaces = 5;
        }
        return new PouleStructure(nrOfPlaces);
    }

    public getGameAmountRange(sportVariant: Single | AgainstH2h | AgainstGpp | AllInOneGame | GameMode): VoetbalRange {
        if (sportVariant instanceof AgainstH2h) {
            return { min: 1, max: 4 };
        }
        return { min: 1, max: 50 };
    };
}

export interface GameAmountConfigValidations {
    nrOfH2HRange: VoetbalRange;
    gameAmountRange: VoetbalRange;
}