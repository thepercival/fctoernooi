import { CompetitionSport, RoundNumber, GameState, StructureNameService, Category, StructureCell } from "ngx-sport";
import { ScreenConfig } from "../screenConfig/json";
import { PoulesRankingScreen } from "../screens";

export class PouleRankingScreensCreator {

    constructor(protected screenConfig: ScreenConfig, protected maxLines: number) {
    }

    getScreens(firstRoundNumber: RoundNumber, categories: Category[]): PoulesRankingScreen[] {
        let screens: PoulesRankingScreen[] = [];
        categories.forEach((category: Category) => {
            const firstStructureCell = firstRoundNumber.getStructureCell(category);
            screens = screens.concat(this.getCategoryScreens(firstStructureCell));
        });
        return screens;
    }

    getCategoryScreens(firstStructureCell: StructureCell): PoulesRankingScreen[] {
        const structureNameService = new StructureNameService();
        const screens: PoulesRankingScreen[] = [];
        const structureCells: StructureCell[] = this.getStructureCellsForPouleRankings(firstStructureCell).filter(structureCell => structureCell.needsRanking());
        if (structureCells.length === 0) {
            return screens;
        }
        const competitionSports = firstStructureCell.getRoundNumber().getCompetitionSports();
        competitionSports.forEach((competitionSport: CompetitionSport) => {
            structureCells.forEach((structureCell: StructureCell) => {
                const poulesForRanking = structureCell.getPoules().filter(poule => poule.needsRanking());

                const roundsDescription = structureNameService.getStructureCellName(structureCell);
                let pouleOne = poulesForRanking.shift();
                while (pouleOne !== undefined) {
                    const pouleTwo = poulesForRanking.shift();
                    const screen = new PoulesRankingScreen(this.screenConfig, competitionSport, pouleOne, pouleTwo, roundsDescription);
                    screens.push(screen);
                    pouleOne = poulesForRanking.shift();
                }
            });
        });
        return screens;
    }

    protected getStructureCellsForPouleRankings(structureCell: StructureCell): StructureCell[] {
        if (structureCell.getGamesState() === GameState.Created || structureCell.getGamesState() === GameState.InProgress) {
            return [structureCell];
        }
        const nextStructureCell = structureCell.getNext();
        if (nextStructureCell === undefined) {
            return [structureCell];
        }
        if (nextStructureCell.getGamesState() === GameState.Created) {
            return [structureCell, nextStructureCell];
        }
        return this.getStructureCellsForPouleRankings(nextStructureCell);
    }
}