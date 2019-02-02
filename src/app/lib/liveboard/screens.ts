import { Game, Poule } from 'ngx-sport';

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
    constructor(private sponsors: Sponsor[]) {
        super();
        this.description = 'sponsoren';
    }

    getSponsors() {
        return this.sponsors;
    }
}