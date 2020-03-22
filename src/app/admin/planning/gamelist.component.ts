import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, interval, of, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { RoundNumber, Structure } from 'ngx-sport';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';

@Component({
  selector: 'app-tournament-games',
  templateUrl: './gamelist.component.html',
  styleUrls: ['./gamelist.component.css']
})
export class GameListComponent extends TournamentComponent implements OnInit, OnDestroy {
  showPrintBtn: boolean;
  userIsPlannerOrStructureAdmin: boolean;
  shouldShowEndRanking: boolean;
  private refreshPlanningTimer: Subscription;
  reload: boolean;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    private authService: AuthService,
    private planningRepository: PlanningRepository,
    private myNavigation: MyNavigation,
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      const hasNext = this.structure.getFirstRoundNumber().hasNext();
      this.shouldShowEndRanking = (hasNext || this.structure.getRootRound().getPoules().length === 1);
      this.userIsPlannerOrStructureAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(),
        Role.STRUCTUREADMIN + Role.PLANNER);
      this.enableRefreshPlanning(this.structure.getFirstRoundNumber());
      this.processing = false;
    });
    this.showPrintBtn = true;
  }

  private enableRefreshPlanning(roundNumber: RoundNumber) {
    const roundNumberWithoutPlanning = this.getFirstRoundNumberWithoutPlanning(roundNumber);
    if (roundNumberWithoutPlanning !== undefined) {
      this.refreshPlanning(roundNumberWithoutPlanning);
    }
  }

  private getFirstRoundNumberWithoutPlanning(roundNumber: RoundNumber): RoundNumber {
    if (roundNumber.getHasPlanning() === false) {
      return roundNumber;
    }
    if (roundNumber.hasNext() === false) {
      return undefined;
    }
    return this.getFirstRoundNumberWithoutPlanning(roundNumber.getNext());
  }

  scroll() {
    this.myNavigation.scroll();
  }

  linkToStructure() {
    this.router.navigate(['/toernooi/structure', this.tournament.getId()]
    );
  }

  protected refreshPlanning(firstRoundNumberWithoutPlanning: RoundNumber) {
    this.refreshPlanningTimer = interval(5000) // repeats every 5 seconds
      .pipe(
        switchMap(() => this.planningRepository.getObject(firstRoundNumberWithoutPlanning, this.tournament).pipe()),
        catchError(err => of(null))
      ).subscribe(
          /* happy path */(roundNumberOut: RoundNumber) => {
          if (roundNumberOut.getHasPlanning()) {
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

