import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { TournamentUser } from '../../lib/tournament/user';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-tournament-games-edit',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class GameListComponent extends TournamentComponent implements OnInit {
  userRefereeId: number;
  roles: number;

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
      const tournamentUser = this.tournament.getUser(this.authService.getUser())
      this.roles = tournamentUser?.getRoles();
      this.getUserRefereeId(tournamentUser).subscribe(
        userRefereeIdRes => {
          this.userRefereeId = userRefereeIdRes;
          this.processing = false;
        },
        e => { this.processing = false; }
      );
    });
  }

  hasAdminRole(): boolean {
    return (this.roles & Role.ADMIN) === Role.ADMIN;
  }

  getUserRefereeId(tournamentUser: TournamentUser): Observable<number> {
    if (!tournamentUser?.hasRoles(Role.REFEREE)) {
      return of(undefined);
    }
    return this.tournamentRepository.getUserRefereeId(this.tournament);
  }

  scroll() {
    this.myNavigation.scroll();
  }
}

