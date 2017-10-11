import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { Tournament } from '../../tournament';
import { TournamentComponent } from '../component';
import { RoundRepository } from 'voetbaljs/round/repository';

@Component({
    selector: 'app-tournament-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class TournamentHomeComponent extends TournamentComponent {

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        roundRepository: RoundRepository
    ) {
        super( route, router, tournamentRepository, roundRepository );
    }
}
