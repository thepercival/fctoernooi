import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentUser } from '../../lib/tournament/user';
import { Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-tournament-games-edit',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class GameListComponent extends TournamentComponent implements OnInit {
  userRefereeId: number | string | undefined;
  roles: number = 0;
  reload: boolean | undefined;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,

    private authService: AuthService,
    private myNavigation: MyNavigation,
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      const authUser = this.authService.getUser();
      const tournamentUser = authUser ? this.tournament.getUser(authUser) : undefined;
      if (tournamentUser === undefined) {
        this.processing = false;
        return;
      }
      this.roles = tournamentUser ? tournamentUser.getRoles() : 0;
      this.getUserRefereeId(tournamentUser).subscribe(
        (userRefereeId: string | number | undefined) => {
          this.userRefereeId = userRefereeId;
          this.processing = false;
        },
        e => { this.processing = false; }
      );
    });
  }

  hasAdminRole(): boolean {
    return (this.roles & Role.ADMIN) === Role.ADMIN;
  }

  getUserRefereeId(tournamentUser: TournamentUser): Observable<string | number | undefined> {
    if (!tournamentUser.hasRoles(Role.REFEREE)) {
      return of(0);
    }
    return this.tournamentRepository.getUserRefereeId(this.tournament);
  }

  scroll() {
    this.myNavigation.scroll();
  }
}
