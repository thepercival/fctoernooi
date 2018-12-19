import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService, StructureRepository } from 'ngx-sport';

import { AuthService } from '../../../auth/auth.service';
import { TournamentComponent } from '../component';
import { IPlanningScrollTo } from '../planning/view/component';
import { TournamentRepository } from '../repository';
import { TournamentRole } from '../role';

@Component({
  selector: 'app-tournament-games',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class GameListComponent extends TournamentComponent implements OnInit {

  planningService: PlanningService;
  showPrintBtn: boolean;
  noRefresh = false;
  scrollTo: IPlanningScrollTo = {};
  userIsPlannerOrStructureAdmin: boolean;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    private authService: AuthService
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.scrollTo.roundNumber = +params.get('scrollToRoundNumber');
      this.scrollTo.gameId = +params.get('scrollToGameId');
    });
    super.myNgOnInit(() => {
      this.setPlanningService();
    });
    this.showPrintBtn = true;
  }

  setPlanningService() {
    this.planningService = new PlanningService(this.tournament.getCompetition());
    this.userIsPlannerOrStructureAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(),
      TournamentRole.STRUCTUREADMIN + TournamentRole.PLANNER);

    this.processing = false;
  }
}

