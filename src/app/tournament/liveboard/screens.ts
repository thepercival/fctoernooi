import { Game, Poule, RoundNumber } from 'ngx-sport';

import { Sponsor } from '../../lib/sponsor';

export class Screen {
    constructor(public roundNumber: RoundNumber) {
    }
}

export class PoulesRankingScreen extends Screen {
    private pouleOne: Poule;
    private pouleTwo: Poule;
    private description: string;

    constructor(roundNumber: RoundNumber, pouleOne: Poule, pouleTwo: Poule, roundsDescription: string) {
        super(roundNumber);
        this.pouleOne = pouleOne;
        this.pouleTwo = pouleTwo;
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

    getDescription() {
        return this.description;
    }
}

export class EndRankingScreen extends Screen {
    constructor(roundNumber: RoundNumber, public filterStart: number, public filterEnd: number) {
        super(roundNumber);
    }
    getDescription() {
        return 'eindstand';
    }
}

export class GamesScreen extends Screen {
    private games: Game[];
    protected description: string;

    constructor(roundNumber: RoundNumber, games: Game[]) {
        super(roundNumber);
        this.games = games;
    }

    getGames(): Game[] {
        return this.games;
    }

    getDescription() {
        return this.description;
    }
}

export interface IGamesScreen {
    isScheduled(): boolean;
}

export class ScheduledGamesScreen extends GamesScreen implements IGamesScreen {

    constructor(roundNumber: RoundNumber, scheduledGames: Game[]) {
        super(roundNumber, scheduledGames);
        this.description = 'programma';
    }

    isScheduled(): boolean {
        return true;
    }
}

export class PlayedGamesScreen extends GamesScreen implements IGamesScreen {
    playedGames: Game[];

    constructor(roundNumber: RoundNumber, playedGames: Game[], roundsDescription: string) {
        super(roundNumber, playedGames);
        this.description = 'uitslagen - ' + roundsDescription;
    }

    isScheduled(): boolean {
        return false;
    }
}


export class SponsorScreen extends Screen {
    private sponsors: Sponsor[]; // max 8

    constructor(roundNumber: RoundNumber, sponsors: Sponsor[]) {
        super(roundNumber);
        this.sponsors = sponsors;
    }

    getDescription() {
        return 'sponsoren';
    }

    getSponsors() {
        return this.sponsors;
    }
}