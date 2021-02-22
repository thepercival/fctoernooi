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
import { Observable, of, Subscription, interval } from 'rxjs';
import { RoundNumber } from 'ngx-sport';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-tournament-games-edit',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class GameListComponent extends TournamentComponent implements OnInit {
  userRefereeId: number | string | undefined;
  roles: number = 0;
  private refreshPlanningTimer: Subscription | undefined;
  reload: boolean | undefined;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    private authService: AuthService,
    private myNavigation: MyNavigation,
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.enableRefreshPlanning(this.structure.getFirstRoundNumber());
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

  /** REFRESH NO-PLANNING PART */
  private enableRefreshPlanning(roundNumber: RoundNumber) {
    const roundNumberWithoutPlanning = this.getFirstRoundNumberWithoutPlanning(roundNumber);
    if (roundNumberWithoutPlanning !== undefined) {
      this.refreshPlanning(roundNumberWithoutPlanning);
    }
  }

  private getFirstRoundNumberWithoutPlanning(roundNumber: RoundNumber): RoundNumber | undefined {
    if (roundNumber.getHasPlanning() === false) {
      return roundNumber;
    }
    const nextRoundNumber = roundNumber.getNext();
    return nextRoundNumber ? this.getFirstRoundNumberWithoutPlanning(nextRoundNumber) : undefined;
  }

  protected refreshPlanning(firstRoundNumberWithoutPlanning: RoundNumber) {
    this.refreshPlanningTimer = interval(5000) // repeats every 5 seconds
      .pipe(
        switchMap(() => this.planningRepository.get(this.structure, this.tournament, firstRoundNumberWithoutPlanning.getNumber()).pipe()),
        catchError(err => of(null))
      ).subscribe(
          /* happy path */(roundNumberOut: RoundNumber | null) => {
          if (roundNumberOut && roundNumberOut.getHasPlanning()) {
            this.reload = ((this.reload === undefined) ? true : !this.reload);
            this.stopPlanningRefresh();
            this.enableRefreshPlanning(roundNumberOut);
          }
        });
  }

  ngOnDestroy() {
    this.stopPlanningRefresh();
  }

  stopPlanningRefresh() {
    if (this.refreshPlanningTimer !== undefined) {
      this.refreshPlanningTimer.unsubscribe();
    }
  }
}
