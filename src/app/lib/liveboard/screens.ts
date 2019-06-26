import { Game, Poule, Round } from 'ngx-sport';

import { Sponsor } from '../sponsor';

export class Screen {
    protected description: string;

    getDescription() {
        return this.description;
    }
}

export class PoulesRankingScreen extends Screen {
    constructor(
        private pouleOne: Poule,
        private pouleTwo: Poule,
        roundsDescription: string) {
        super();
        this.description = 'stand - ' + roundsDescription;
    }

    getFirstPoule(): Poule {
        return this.pouleOne;
    }

    getLastPoule(): Poule {
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
    constructor(public filterStart: number, public filterEnd: number) {
        super();
        this.description = 'eindstand';
    }
}

export class GamesScreen extends Screen {
    constructor(protected games: Game[]) {
        super();
        this.games = games;
    }

    getGames(): Game[] {
        return this.games;
    }
}

export interface IGamesScreen {
    isScheduled(): boolean;
}

export class CreatedAndInplayGamesScreen extends GamesScreen implements IGamesScreen {

    constructor(scheduledGames: Game[]) {
        super(scheduledGames);
        this.description = 'programma';
    }

    isScheduled(): boolean {
        return true;
    }
}

export class PlayedGamesScreen extends GamesScreen implements IGamesScreen {
    playedGames: Game[];

    constructor(playedGames: Game[]) {
        super(playedGames);
        this.description = 'uitslagen';
    }

    isScheduled(): boolean {
        return false;
    }
}

export class SponsorScreen extends Screen {
    private sponsors: Sponsor[] = [];

    constructor(private number) {
        super();
        this.description = 'sponsoren';
    }

    getNumber() {
        return this.number;
    }

    getSponsors() {
        return this.sponsors;
    }
}

export class SponsorScreenService {
    static readonly MAXNROFSPONSORSCREENS: number = 4;
    static readonly MAXNROFSPONSORSPERSCREEN: number = 9;

    private screens: SponsorScreen[];

    constructor(private sponsors: Sponsor[]) {
        this.initScreens(sponsors);
    }

    private initScreens(sponsors: Sponsor[]) {
        this.screens = [];
        sponsors.forEach(sponsor => {
            let screen = this.getScreen(sponsor.getScreenNr());
            if (screen === undefined && this.screens.length < SponsorScreenService.MAXNROFSPONSORSCREENS) {
                screen = new SponsorScreen(sponsor.getScreenNr());
                this.screens.push(screen);
            }
            if (screen.getSponsors().length < SponsorScreenService.MAXNROFSPONSORSPERSCREEN) {
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

    getScreen(screenNr: number): SponsorScreen {
        return this.screens.find(screen => screen.getNumber() === screenNr);
    }

    getMaxNrOfSponsors(): number {
        return SponsorScreenService.MAXNROFSPONSORSCREENS * SponsorScreenService.MAXNROFSPONSORSPERSCREEN;
    }
}
