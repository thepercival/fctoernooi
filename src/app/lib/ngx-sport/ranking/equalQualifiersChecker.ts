import { RankingService, JsonAgainstGame, JsonTogetherGame, AgainstGame, TogetherGame, NameService, GameMapper, State, RankedRoundItem, QualifyRuleMultiple, QualifyGroup } from "ngx-sport";

export class EqualQualifiersChecker {

    private rankingService: RankingService;
    private jsonOriginalGame: JsonAgainstGame | JsonTogetherGame;

    constructor(
        private game: AgainstGame | TogetherGame,
        private nameService: NameService,
        private gameMapper: GameMapper
    ) {
        const roundNumber = game.getRound().getNumber();
        const gameMode = roundNumber.getValidPlanningConfig().getGameMode();
        this.rankingService = new RankingService(gameMode, roundNumber.getCompetition().getRankingRuleSet());
        this.rankingService.disableCache();
        this.jsonOriginalGame = this.gameMapper.toJson(game);
    }

    getWarnings(jsonGame: JsonAgainstGame | JsonTogetherGame): string[] {
        this.game = this.gameMapper.toExisting(jsonGame, this.game);

        const poule = this.game.getPoule();
        if (poule.getState() !== State.Finished) {
            return [];
        }
        const round = poule.getRound();

        const pouleRankingItems = this.rankingService.getItemsForPoule(this.game.getPoule());
        const equalPouleItems = this.getEqualPouleRankingItemsWithQualifyRules(pouleRankingItems);
        const postFix = '(' + this.nameService.getPouleName(this.game.getPoule(), true) + ')';
        let warnings: string[] = this.getWarningsForEqualQualifiersHelper(equalPouleItems, postFix);

        if (round.getState() !== State.Finished) {
            return warnings;
        }
        round.getQualifyGroups().forEach(qualifyGroup => {
            qualifyGroup.getHorizontalPoules().forEach(horizontalPoule => {
                const multipleRule = horizontalPoule.getQualifyRuleMultiple();
                if (multipleRule === undefined) {
                    return;
                }
                const rankedItems = this.rankingService.getItemsForHorizontalPoule(horizontalPoule);
                const equalRuleItems = this.getEqualRuleRankingItems(multipleRule, rankedItems);
                const postFixTmp = '(' + this.nameService.getHorizontalPouleName(horizontalPoule) + ')';
                warnings = warnings.concat(this.getWarningsForEqualQualifiersHelper(equalRuleItems, postFixTmp));
            });
        });

        this.game = this.gameMapper.toExisting(this.jsonOriginalGame, this.game);
        return warnings;
    }

    protected getWarningsForEqualQualifiersHelper(equalItemsPerRank: RankedRoundItem[][], postFix: string): string[] {
        return equalItemsPerRank.map(equalItems => {
            const names: string[] = equalItems.map(equalItem => {
                return this.nameService.getPlaceName(equalItem.getPlace(), true, true);
            });
            return names.join(' & ') + ' zijn precies gelijk geëindigd' + postFix;
        });
    }

    protected getEqualRuleRankingItems(multipleRule: QualifyRuleMultiple, rankingItems: RankedRoundItem[]): RankedRoundItem[][] {
        if (multipleRule.getWinnersOrLosers() === QualifyGroup.LOSERS) {
            rankingItems = this.reverseRanking(rankingItems);
        }
        const equalItemsPerRank = this.getEqualRankedItems(rankingItems);
        const nrToQualify = multipleRule.getToPlaces().length;
        return equalItemsPerRank.filter(equalItems => {
            const equalRank = equalItems[0].getRank();
            const nrToQualifyTmp = nrToQualify - (equalRank - 1);
            return nrToQualifyTmp > 0 && equalItems.length > nrToQualifyTmp;
        });
    }

    protected reverseRanking(rankingItems: RankedRoundItem[]): RankedRoundItem[] {
        const nrOfItems = rankingItems.length;
        const reversedRankingItems = [];
        rankingItems.forEach(rankingItem => {
            const uniqueRank = (nrOfItems + 1) - rankingItem.getUniqueRank();
            const nrOfEqualRank = this.rankingService.getItemsByRank(rankingItems, rankingItem.getRank()).length;
            const rank = (nrOfItems + 1) - (rankingItem.getRank() + (nrOfEqualRank - 1));
            reversedRankingItems.push(new RankedRoundItem(rankingItem.getUnranked(), uniqueRank, rank));
        });
        reversedRankingItems.sort((itemA, itemB) => itemA.getUniqueRank() - itemB.getUniqueRank());
        return reversedRankingItems;
    }

    protected getEqualPouleRankingItemsWithQualifyRules(rankingItems: RankedRoundItem[]): RankedRoundItem[][] {
        const equalItemsPerRank = this.getEqualRankedItems(rankingItems);
        return equalItemsPerRank.filter(equalItems => {
            return equalItems.some(item => {
                const place = item.getPlace();
                return place.getToQualifyRules().length > 0;
            });
        });
    }

    protected getEqualRankedItems(rankingItems: RankedRoundItem[]): RankedRoundItem[][] {
        const equalItems = [];
        const maxRank = rankingItems[rankingItems.length - 1].getRank();
        for (let rank = 1; rank <= maxRank; rank++) {
            const equalItemsTmp = this.rankingService.getItemsByRank(rankingItems, rank);
            if (equalItemsTmp.length > 1) {
                equalItems.push(equalItemsTmp);
            }
        }
        return equalItems;
    }
}