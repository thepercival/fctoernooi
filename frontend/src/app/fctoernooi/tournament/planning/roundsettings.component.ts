import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { TournamentComponent } from '../component';
import { RoundRepository } from 'voetbaljs/round/repository';
import { Round } from 'voetbaljs/round';

@Component({
    selector: 'app-tournament-roundsettings',
    templateUrl: './roundsettings.component.html',
    styleUrls: ['./roundsettings.component.css']
})
export class TournamentRoundSettingsComponent extends TournamentComponent implements OnInit {

    roundToEdit: Round;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        roundRepository: RoundRepository
    ) {
        super( route, router, tournamentRepository, roundRepository );
    }

    getWinnersLosersDescription( winnersOrLosers: number ): string {
        const description = this.structureService.getWinnersLosersDescription( winnersOrLosers );
        return ( description !== '' ? description + 's' : description );
    }

    getClassPostfix( winnersOrLosers: number): string {
        return winnersOrLosers === Round.WINNERS ? 'success' : ( winnersOrLosers === Round.LOSERS ? 'danger' : '');
    }

    ngOnInit() {
        super.myNgOnInit( () => this.setCurrentRound() );
    }

    setCurrentRound() {
        this.sub = this.route.params.subscribe(params => {
            this.roundToEdit = this.structureService.getRoundById(+params['roundid']);
        });
    }
}
