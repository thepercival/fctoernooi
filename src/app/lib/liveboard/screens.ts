import { AgainstGame, TogetherGame, Poule, GameMode } from 'ngx-sport';

import { Sponsor } from '../sponsor';
import { VoetbalRange } from 'ngx-sport';
import { BatchViewMode } from '../../public/liveboard/games.liveboard.component';

export class LiveboardScreen {
    protected description: string = '';

    getDescription() {
        return this.description;
    }
}

export class PoulesRankingScreen extends LiveboardScreen {
    constructor(
        private pouleOne: Poule,
        private pouleTwo: Poule | undefined,
        roundsDescription: string) {
        super();
        this.description = 'stand - ' + roundsDescription;
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
    constructor(public range: VoetbalRange) {
        super();
        this.description = 'eindstand';
    }
}

export abstract class GamesScreen extends LiveboardScreen {

    protected usedGameModes: number = 0;
    protected games: (AgainstGame | TogetherGame)[] = [];

    constructor(protected maxLines: number) {
        super();
        // this.screenGames = { usedGameModes: 0, games: [] };
    }

    public abstract getBatchViewMode(): BatchViewMode | undefined;

    // public hasgetBatchViewMode(): BatchViewMode | undefined;

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

    onlyGameModeAgainst(): boolean {
        return this.usedGameModes === GameMode.Against;
    }

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

    constructor(maxLines: number, protected previous?: ScheduleScreen) {
        super(maxLines);
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
    public getBatchViewMode(): BatchViewMode | undefined {
        return undefined;
    }

    setDescription(description: string) {
        this.description = description;
    }

    createNext(): ScheduleScreen {
        this.setDescription(this.description + ' <span class="badge badge-info">deel 1</span>');
        this.next = new ScheduleScreen(this.maxLines, this);
        this.next.setDescription(this.next.description + ' <span class="badge badge-info">deel 2</span>');
        return this.next;
    }
}

export class ResultsScreen extends GamesScreen implements IGamesScreen {
    constructor(maxLines: number) {
        super(maxLines);
        this.description = 'uitslagen';
    }

    isScheduled(): boolean {
        return false;
    }

    public getBatchViewMode(): BatchViewMode | undefined {
        return undefined;
    }
}

export class SponsorScreen extends LiveboardScreen {
    private sponsors: Sponsor[] = [];

    constructor(private number: number) {
        super();
        this.description = 'sponsoren';
    }

    getNumber(): number {
        return this.number;
    }

    getSponsors(): Sponsor[] {
        return this.sponsors;
    }
}
