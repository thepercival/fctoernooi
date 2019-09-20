import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService, StructureRepository } from 'ngx-sport';

import { AuthService } from '../../auth/auth.service';
import { MyNavigation } from '../../common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';

@Component({
  selector: 'app-tournament-games',
  templateUrl: './gamelist.component.html',
  styleUrls: ['./gamelist.component.css']
})
export class GameListComponent extends TournamentComponent implements OnInit {

  planningService: PlanningService;
  showPrintBtn: boolean;
  noRefresh = false;
  userIsPlannerOrStructureAdmin: boolean;
  shouldShowEndRanking: boolean;

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
      this.setPlanningService();
      this.shouldShowEndRanking = (this.structure.getFirstRoundNumber().hasNext() || this.structure.getRootRound().getPoules().length === 1);
    });
    this.showPrintBtn = true;
  }

  scroll() {
    this.myNavigation.scroll();
  }

  setPlanningService() {
    this.planningService = new PlanningService(this.competition);
    this.userIsPlannerOrStructureAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(),
      Role.STRUCTUREADMIN + Role.PLANNER);

    this.processing = false;
  }

  linkToStructure() {
    this.router.navigate(['/toernooi/structure', this.tournament.getId()]
    );
  }
}

