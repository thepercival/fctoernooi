import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { AuthService } from '../../../auth/auth.service';
import { TournamentComponent } from '../component';
import { RoundRepository } from 'voetbaljs/round/repository';
import { TournamentRole } from '../role';

@Component({
    selector: 'app-tournament-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class TournamentHomeComponent extends TournamentComponent {

    deleteAlert: string = null;
    showRemoveQuestion = false;

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        roundRepository: RoundRepository
    ) {
        super( route, router, tournamentRepository, roundRepository );
    }

    isAdmin(): boolean {
        return this.tournament.hasRole( this.authService.getLoggedInUserId(), TournamentRole.ADMIN );
    }

    remove() {
        this.tournamentRepository.removeObject( this.tournament )
            .subscribe(
                /* happy path */ (deleted: boolean) => {
                    if( deleted ) {
                        this.deleteAlert = 'redirect to home with message';
                    } else {
                        this.deleteAlert = 'het toernooi kon niet verwijderd worden';
                    }
                    // redirect to home with message
                },
                /* error path */ e => {
                    this.deleteAlert = 'het toernooi kon niet verwijderd worden';
                },
                /* onComplete */ () => {}
            );
    }

    toggleRemoveQuestion( showRemoveQuastion: boolean ) {
        this.showRemoveQuestion = showRemoveQuastion;
    }
}
