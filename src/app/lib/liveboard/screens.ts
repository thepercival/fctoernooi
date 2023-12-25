import { AgainstGame, TogetherGame, Poule, GameMode, CompetitionSport, Category, VoetbalRange } from 'ngx-sport';

import { Sponsor } from '../sponsor';
import { BatchViewMode } from '../../public/liveboard/games.liveboard.component';
import { ScreenConfig } from './screenConfig/json';
import { ScreenConfigName } from './screenConfig/name';

export class LiveboardScreen {

    protected description: string = '';

    constructor(protected config: ScreenConfig) {
    }

    getConfig(): ScreenConfig {
        return this.config;
    }

    getDescription() {
        return this.description;
    }
}

export class PoulesRankingScreen extends LiveboardScreen {
    constructor(
        config: ScreenConfig,
        private competitionSport: CompetitionSport,
        private pouleOne: Poule,
        private pouleTwo: Poule | undefined,
        roundsDescription: string) {
        super(config);
        this.description = 'stand - ' + roundsDescription;
    }

    getCompetitionSport(): CompetitionSport {
        return this.competitionSport;
    }

    getFirstPoule(): Poule {
        return this.pouleOne;
    }

    getLastPoule(): Poule | undefined {
        return this.pouleTwo;
    }

    getPoules(): Poule[] {
        const poules = [this.pouleOne];
        if (this.pouleTwo !== undefined) {
            poules.push(this.pouleTwo);
        }
        return poules;
    }
}

export class EndRankingScreen extends LiveboardScreen {
    constructor(config: ScreenConfig, private category: Category, public range: VoetbalRange) {
        super(config);
        this.description = 'eindstand';
    }

    public getCategory(): Category {
        return this.category;
    }
}

export abstract class GamesScreen extends LiveboardScreen {

    // protected usedGameModes: number = 0;
    protected games: (AgainstGame | TogetherGame)[] = [];

    constructor(config: ScreenConfig, protected maxLines: number) {
        super(config);
        // this.screenGames = { usedGameModes: 0, games: [] };
    }

    public getGames(): (AgainstGame | TogetherGame)[] {
        return this.games;
    }

    addGame(game: AgainstGame | TogetherGame): boolean {
        if (!this.hasEnoughLines()) {
            this.games.push(game);
            // this.usedGameModes |= game.getPlanningConfig().getGameMode();
            return true;
        }
        return false;
    }

    isEmpty(): boolean {
        return this.games.length === 0;
    }

    hasEnoughLines(): boolean {
        return this.games.length >= this.maxLines;
    }

    // onlyGameModeAgainst(): boolean {
    //     return this.usedGameModes === GameMode.Against;
    // }

    // onlyGameModeTogether(): boolean {
    //     return this.usedGameModes === GameMode.Together;
    // }

    // bothGameModes(): boolean {
    //     return this.usedGameModes === (GameMode.Against + GameMode.Together);
    // }
}

export interface IGamesScreen {
    isScheduled(): boolean;
}

export class ScheduleScreen extends GamesScreen implements IGamesScreen {
    protected next: ScheduleScreen | undefined;
    
    constructor(config: ScreenConfig, maxLines: number, protected batchViewModeHeader: BatchViewMode, protected previous?: ScheduleScreen) {
        super(config, maxLines);
        this.setDescription('programma');
    }

    isScheduled(): boolean {
        return true;
    }

    isFull(): boolean {
        return this.games.length >= this.maxLines;
    }

    isFirst(): boolean {
        return this.previous === undefined;
    }

    getNext(): ScheduleScreen | undefined {
        return this.next;
    }

    hasNext(): boolean {
        return this.next !== undefined;
    }

    // if has by date else get by nr else undefined
    public getBatchViewModeHeader(): BatchViewMode {
        return this.batchViewModeHeader;
    }

    setDescription(description: string) {
        this.description = description;
    }

    createNext(batchViewModeHeader: BatchViewMode): ScheduleScreen {
        this.setDescription(this.description + ' <span class="badge bg-info">deel 1</span>');
        this.next = new ScheduleScreen(this.config, this.maxLines, batchViewModeHeader);
        this.next.setDescription(this.next.description + ' <span class="badge bg-info">deel 2</span>');
        return this.next;
    }
}

export class ResultsScreen extends GamesScreen implements IGamesScreen {
    constructor(config: ScreenConfig, maxLines: number) {
        super(config, maxLines);
        this.description = 'uitslagen';
    }

    isScheduled(): boolean {
        return false;
    }
}

export class SponsorScreen extends LiveboardScreen {
    private sponsors: Sponsor[] = [];

    constructor(config: ScreenConfig, private number: number) {
        super(config);
        this.description = 'sponsoren';
    }

    getNumber(): number {
        return this.number;
    }

    getSponsors(): Sponsor[] {
        return this.sponsors;
    }
}
