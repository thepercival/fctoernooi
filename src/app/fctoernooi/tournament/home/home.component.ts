import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { StructureRepository } from 'ngx-sport';

import { AuthService } from '../../../auth/auth.service';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';
import { TournamentRole } from '../role';

@Component({
    selector: 'app-tournament-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class TournamentHomeComponent extends TournamentComponent implements OnInit {

    deleteAlert: string;
    showRemoveQuestion = false;

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository
    ) {
        super(route, router, tournamentRepository, structureRepository);
    }

    ngOnInit() {
        super.myNgOnInit();
    }

    isAdmin(): boolean {
        return this.tournament.hasRole(this.authService.getLoggedInUserId(), TournamentRole.ADMIN);
    }

    remove() {
        this.tournamentRepository.removeObject(this.tournament)
            .subscribe(
                /* happy path */(deleted: boolean) => {
                if (deleted) {
                    const navigationExtras: NavigationExtras = {
                        queryParams: { type: 'success', message: 'het toernooi is verwijderd' }
                    };
                    this.router.navigate(['/home'], navigationExtras);
                } else {
                    this.deleteAlert = 'het toernooi kon niet verwijderd worden';
                }
                // redirect to home with message
            },
                /* error path */ e => {
                this.deleteAlert = 'het toernooi kon niet verwijderd worden';
            },
                /* onComplete */() => { }
            );
    }

    toggleRemoveQuestion(showRemoveQuastion: boolean) {
        this.showRemoveQuestion = showRemoveQuastion;
    }
}
