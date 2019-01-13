import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Game,
    NameService,
    PlanningService,
    Poule,
    PoulePlace,
    Ranking,
    RankingItem,
    Round,
    RoundNumber,
    StructureRepository,
} from 'ngx-sport';
import { Subscription, timer } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { GlobalEventsManager } from '../../common/eventmanager';
import { IconManager } from '../../common/iconmanager';
import { Role } from '../../lib/role';
import { Sponsor } from '../../lib/sponsor';
import { TournamentRepository } from '../../lib/tournament/repository';
import { NavBarTournamentTVViewLink } from '../../nav/nav.component';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-scoreboard-game',
    templateUrl: './tv.component.html',
    styleUrls: []
})
export class TournamentScoreboardGameComponent {

    hasReferees() {
        return this.tournament.getCompetition().getReferees().length > 0;
    }

    public nameService
    public getScore
    public screenDef
    public planningService
    public hasFields

    constructor(
        public planningService: PlanningService,
        public nameService: NameService
    ) {
        
        this.ranking = new Ranking(Ranking.RULESSET_WC);
    }

    isScheduled(): boolean {
        return this.screenDef instanceof ScheduledGamesScreenDefinition;
    }

    hasFields() {
        return this.tournament.getCompetition().getFields().length > 0;
    }

    getScore(game: Game): string {
        const sScore = ' - ';
        if (game.getState() !== Game.STATE_PLAYED) {
            return sScore;
        }
        const finalScore = game.getFinalScore();
        if (finalScore === undefined) {
            return sScore;
        }
        return finalScore.getHome() + sScore + finalScore.getAway();
    }
}

export class ScreenDefinition {
    constructor(public roundNumber: RoundNumber) {
    }
}

export class GamesScreenDefinition extends ScreenDefinition {
    private games: Game[]; // max 8
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

export interface IGamesScreenDefinition {
    isScheduled(): boolean;
}

export class ScheduledGamesScreenDefinition extends GamesScreenDefinition implements IGamesScreenDefinition {

    constructor(roundNumber: RoundNumber, scheduledGames: Game[]) {
        super(roundNumber, scheduledGames);
        this.description = 'programma';
    }

    isScheduled(): boolean {
        return true;
    }
}