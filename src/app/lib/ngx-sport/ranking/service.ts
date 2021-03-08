import { PlaceLocation } from '../place/location';
import { Poule } from '../poule';
import { HorizontalPoule } from '../poule/horizontal';
import { Place } from '../place';
import { RankedRoundItem } from './item';
import { Round } from '../qualify/group';
import { ScoreConfig } from '../score/config';

export class TournamentRankingService {
    protected rankedRoundItemMap: RankedRoundItemMap = {};

    constructor(
        private gameStates?: number
    ) {
    }

    //     pointsCalculation: PointsCalculation,
    //     private helper: AgainstRankingServiceHelper | TogetherRankingServiceHelper;


    //     if(pointsCalculation === PointsCalculation.Scores) {
    //     this.helper = new TogetherRankingServiceHelper(gameStates);
    // } else {
    //     this.helper = new AgainstRankingServiceHelper(rulesSet, gameStates);
    // }

    // // getRuleDescriptions moet per scoreConfig
    // // bij meerdere sporten en verschillende gamemodi beiden tonen

    getSportRankingService(): SportRankingService {

    }


    getItemsForPoule(poule: Poule, disableCache?: boolean): RankedRoundItem[] {
        if (!disableCache && this.rankedRoundItemMap[poule.getNumber()] !== undefined) {
            return this.rankedRoundItemMap[poule.getNumber()];
        }
        const round: Round = poule.getRound();
        round.getValidScoreConfigs().forEach((scoreConfig: ScoreConfig) => {
            const sportRankingService = this.getSportRankingService(scoreConfig.getCompetitionSport());
            // doe hier de ranking per sport of competitie
        });

        const getter = new RankingItemsGetterAgainst(round, scoreConfig, this.gameStates);
        const unrankedItems: UnrankedRoundItem[] = getter.getUnrankedItems(poule.getPlaces(), poule.getAgainstGames());
        const rankedItems = this.rankItems(unrankedItems, true);
        this.rankedRoundItemMap[poule.getNumber()] = rankedItems;


        return this.rankedRoundItemMap[poule.getNumber()];


    }

    getPlaceLocationsForHorizontalPoule(horizontalPoule: HorizontalPoule): PlaceLocation[] {
        // loop door de sporten
        return this.helper.getPlaceLocationsForHorizontalPoule(horizontalPoule);
    }

    getPlacesForHorizontalPoule(horizontalPoule: HorizontalPoule): Place[] {
        // loop door de sporten
        return this.helper.getPlacesForHorizontalPoule(horizontalPoule);
    }

    getItemsForHorizontalPoule(horizontalPoule: HorizontalPoule, checkOnSingleQualifyRule?: boolean): RankedRoundItem[] {
        // loop door de sporten
        return this.helper.getItemsForHorizontalPoule(horizontalPoule, checkOnSingleQualifyRule);
    }

    getItemByRank(rankingItems: RankedRoundItem[], rank: number): RankedRoundItem | undefined {
        return rankingItems.find(rankingItemIt => rankingItemIt.getUniqueRank() === rank);
    }

    getItemsByRank(rankingItems: RankedRoundItem[], rank: number): RankedRoundItem[] {
        return rankingItems.filter(rankingItemIt => rankingItemIt.getRank() === rank);
    }
}

interface RankedRoundItemMap {
    [key: number]: RankedRoundItem[];
}
