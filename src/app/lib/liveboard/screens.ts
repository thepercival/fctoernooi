import { AgainstGame, TogetherGame, Poule, GameMode, TogetherScore } from 'ngx-sport';

import { Sponsor } from '../sponsor';
import { VoetbalRange } from 'ngx-sport';

export class Screen {
    protected description: string = '';

    getDescription() {
        return this.description;
    }
}

export class PoulesRankingScreen extends Screen {
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

export class EndRankingScreen extends Screen {
    constructor(public range: VoetbalRange) {
        super();
        this.description = 'eindstand';
    }
}

export class GamesScreen extends Screen {

    constructor(protected screenGames: ScreenGames) {
        super();
    }

    getGames(): (AgainstGame | TogetherGame)[] {
        return this.screenGames.games;
    }

    addGame(game: AgainstGame | TogetherGame) {
        this.screenGames.games.push(game);
    }

    isEmpty(): boolean {
        return this.screenGames.games.length === 0;
    }

    onlyGameModeAgainst(): boolean {
        return this.screenGames.usedGameModes === GameMode.Against;
    }

    onlyGameModeTogether(): boolean {
        return this.screenGames.usedGameModes === GameMode.Together;
    }

    bothGameModes(): boolean {
        return this.screenGames.usedGameModes === (GameMode.Against + GameMode.Together);
    }
}

export interface IGamesScreen {
    isScheduled(): boolean;
}

export class CreatedAndInplayGamesScreen extends GamesScreen implements IGamesScreen {
    protected next: CreatedAndInplayGamesScreen | undefined;

    constructor(protected maxLines: number, protected previous?: CreatedAndInplayGamesScreen) {
        super({ usedGameModes: 0, games: [] });
        this.setDescription('programma');
    }

    isScheduled(): boolean {
        return true;
    }

    isFull(): boolean {
        return this.screenGames.games.length >= this.maxLines;
    }

    isFirst(): boolean {
        return this.previous === undefined;
    }

    getNext(): CreatedAndInplayGamesScreen | undefined {
        return this.next;
    }

    hasNext(): boolean {
        return this.next !== undefined;
    }

    setDescription(description: string) {
        this.description = description;
    }

    createNext(): CreatedAndInplayGamesScreen {
        this.setDescription(this.description + ' <span class="badge badge-info">deel 1</span>');
        this.next = new CreatedAndInplayGamesScreen(this.maxLines, this);
        this.next.setDescription(this.next.description + ' <span class="badge badge-info">deel 2</span>');
        return this.next;
    }
}

export class PlayedGamesScreen extends GamesScreen implements IGamesScreen {
    constructor(screenGames: ScreenGames) {
        super(screenGames);
        this.description = 'uitslagen';
    }

    isScheduled(): boolean {
        return false;
    }
}

export class SponsorScreen extends Screen {
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

export class SponsorScreenService {
    static readonly MAXNROFSPONSORSCREENS: number = 4;
    static readonly MAXNROFSPONSORSPERSCREEN: number = 4;

    private screens: SponsorScreen[] = [];

    constructor(sponsors: Sponsor[]) {
        this.initScreens(sponsors);
    }

    private initScreens(sponsors: Sponsor[]) {
        sponsors.forEach(sponsor => {
            let screen = this.getScreen(sponsor.getScreenNr());
            if (screen === undefined && this.screens.length < SponsorScreenService.MAXNROFSPONSORSCREENS) {
                screen = new SponsorScreen(sponsor.getScreenNr());
                this.screens.push(screen);
            }
            if (screen && screen.getSponsors().length < SponsorScreenService.MAXNROFSPONSORSPERSCREEN) {
                screen.getSponsors().push(sponsor);
            }
        });
        this.screens.sort((s1, s2) => {
            return (s1.getNumber() > s2.getNumber() ? 1 : -1);
        });
    }

    getScreens(): SponsorScreen[] {
        return this.screens;
    }

    getScreen(screenNr: number): SponsorScreen | undefined {
        return this.screens.find(screen => screen.getNumber() === screenNr);
    }

    getMaxNrOfSponsors(): number {
        return SponsorScreenService.MAXNROFSPONSORSCREENS * SponsorScreenService.MAXNROFSPONSORSPERSCREEN;
    }
}

export interface ScreenGames {
    usedGameModes: number;
    games: (AgainstGame | TogetherGame)[];
}