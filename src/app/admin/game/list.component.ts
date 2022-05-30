import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentUser } from '../../lib/tournament/user';
import { Observable, of } from 'rxjs';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { StartLocationMap, StructureNameService } from 'ngx-sport';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FavoritesRepository } from '../../lib/favorites/repository';

@Component({
  selector: 'app-tournament-games-edit',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class GameListComponent extends TournamentComponent implements OnInit {
  userRefereeId: number | string | undefined;
  roles: number = 0;
  public structureNameService!: StructureNameService;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    private authService: AuthService,
    private myNavigation: MyNavigation,
  ) {
    super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      const loggedInUserId = this.authService.getLoggedInUserId();
      const tournamentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
      if (tournamentUser === undefined) {
        this.processing = false;
        return;
      }
      const startLocationMap = new StartLocationMap(this.tournament.getCompetitors());
      this.structureNameService = new StructureNameService(startLocationMap);
      this.roles = tournamentUser ? tournamentUser.getRoles() : 0;
      this.getUserRefereeId(tournamentUser)
        .subscribe({
          next: (userRefereeId: string | number | undefined) => {
            this.userRefereeId = userRefereeId;
            this.processing = false;
          },
          error: (e) => this.processing = false
        });
    });
  }

  hasAdminRole(): boolean {
    return (this.roles & Role.Admin) === Role.Admin;
  }

  getUserRefereeId(tournamentUser: TournamentUser): Observable<string | number | undefined> {
    if (!tournamentUser.hasRoles(Role.Referee)) {
      return of(0);
    }
    return this.tournamentRepository.getUserRefereeId(this.tournament);
  }

  scroll() {
    this.myNavigation.scroll();
  }
}
