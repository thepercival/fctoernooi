import { JsonAgainstGame, JsonTogetherGame, AgainstGame, TogetherGame, NameService, GameMapper, State, MultipleQualifyRule, QualifyGroup, RoundRankingCalculator, RoundRankingItem, QualifyTarget, Round, Place } from "ngx-sport";

export class EqualQualifiersChecker {

    private roundRankingCalculator: RoundRankingCalculator;
    private jsonOriginalGame: JsonAgainstGame | JsonTogetherGame;

    constructor(
        private game: AgainstGame | TogetherGame,
        private nameService: NameService,
        private gameMapper: GameMapper
    ) {
        this.roundRankingCalculator = new RoundRankingCalculator();
        this.jsonOriginalGame = this.gameMapper.toJson(game);
    }

    getWarnings(jsonGame: JsonAgainstGame | JsonTogetherGame): string[] {
        this.game = this.gameMapper.toExisting(jsonGame, this.game);

        const poule = this.game.getPoule();
        if (poule.getState() !== State.Finished) {
            return [];
        }
        const round = poule.getRound();

        const pouleRankingItems = this.roundRankingCalculator.getItemsForPoule(this.game.getPoule());
        const equalPouleItems = this.getEqualPouleRankingItemsWithQualifyRules(round, pouleRankingItems);
        const postFix = '(' + this.nameService.getPouleName(this.game.getPoule(), true) + ')';
        let warnings: string[] = this.getWarningsForEqualQualifiersHelper(equalPouleItems, postFix);

        if (round.getState() !== State.Finished) {
            return warnings;
        }
        round.getQualifyGroups().forEach((qualifyGroup: QualifyGroup) => {
            let multipleRule = qualifyGroup.getMultipleRule();
            if (multipleRule !== undefined) {
                const fromHorPoule = multipleRule.getFromHorizontalPoule();
                const roundRankingItems = this.roundRankingCalculator.getItemsForHorizontalPoule(fromHorPoule);
                const equalRuleItems = this.getEqualRuleRankingItems(multipleRule, roundRankingItems);
                const postFixTmp = '(' + this.nameService.getHorizontalPouleName(fromHorPoule) + ')';
                warnings = warnings.concat(this.getWarningsForEqualQualifiersHelper(equalRuleItems, postFixTmp));
            }
        });

        this.game = this.gameMapper.toExisting(this.jsonOriginalGame, this.game);
        return warnings;
    }

    protected getWarningsForEqualQualifiersHelper(equalItemsPerRank: RoundRankingItem[][], postFix: string): string[] {
        return equalItemsPerRank.map(equalItems => {
            const names: string[] = equalItems.map(equalItem => {
                return this.nameService.getPlaceName(equalItem.getPlace(), true, true);
            });
            return names.join(' & ') + ' zijn precies gelijk geëindigd' + postFix;
        });
    }

    protected getEqualRuleRankingItems(multipleRule: MultipleQualifyRule, rankingItems: RoundRankingItem[]): RoundRankingItem[][] {
        if (multipleRule.getQualifyTarget() === QualifyTarget.Losers) {
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

    protected reverseRanking(rankingItems: RoundRankingItem[]): RoundRankingItem[] {
        const nrOfItems = rankingItems.length;
        const reversedRankingItems: RoundRankingItem[] = [];
        rankingItems.forEach((rankingItem: RoundRankingItem) => {
            const uniqueRank = (nrOfItems + 1) - rankingItem.getUniqueRank();
            const nrOfEqualRank = this.getItemsByRank(rankingItems, rankingItem.getRank()).length;
            const rank = (nrOfItems + 1) - (rankingItem.getRank() + (nrOfEqualRank - 1));
            const roundRankingItem = new RoundRankingItem(rankingItem.getPlace());
            roundRankingItem.setRank(rank, uniqueRank);
            reversedRankingItems.push(roundRankingItem);
        });
        reversedRankingItems.sort((itemA, itemB) => itemA.getUniqueRank() - itemB.getUniqueRank());
        return reversedRankingItems;
    }

    protected getItemsByRank(rankingItems: RoundRankingItem[], rank: number): RoundRankingItem[] {
        return rankingItems.filter(rankingItemIt => rankingItemIt.getRank() === rank);
    }

    protected getEqualPouleRankingItemsWithQualifyRules(round: Round, rankingItems: RoundRankingItem[]): RoundRankingItem[][] {
        const equalItemsPerRank = this.getEqualRankedItems(rankingItems);
        return equalItemsPerRank.filter((equalItems: RoundRankingItem[]) => {
            return equalItems.some((item: RoundRankingItem) => this.hasToQualifyRule(item.getPlace()));
        });
    }

    protected hasToQualifyRule(place: Place): boolean {
        return [QualifyTarget.Winners, QualifyTarget.Losers].some((qualifyTarget: QualifyTarget): boolean => {
            return place.getHorizontalPoule(qualifyTarget).getQualifyRule() !== undefined;
        });
    }

    protected getEqualRankedItems(rankingItems: RoundRankingItem[]): RoundRankingItem[][] {
        const equalItems = [];
        const maxRank = rankingItems[rankingItems.length - 1].getRank();
        for (let rank = 1; rank <= maxRank; rank++) {
            const equalItemsTmp = this.getItemsByRank(rankingItems, rank);
            if (equalItemsTmp.length > 1) {
                equalItems.push(equalItemsTmp);
            }
        }
        return equalItems;
    }
}