import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { PlanningService, StructureRepository } from 'ngx-sport';

import { AuthService } from '../../auth/auth.service';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';
import { IPlanningScrollTo } from '../roundnumber/rnview.component';

@Component({
  selector: 'app-tournament-games',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class GameListComponent extends TournamentComponent implements OnInit, AfterViewChecked {

  planningService: PlanningService;
  showPrintBtn: boolean;
  noRefresh = false;
  scrollTo: IPlanningScrollTo = {};
  userIsPlannerOrStructureAdmin: boolean;
  private scrollToEndRanking: string;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    private authService: AuthService,
    private scrollService: ScrollToService,
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.scrollTo.roundNumber = params.get('scrollToRoundNumber') !== null ? +params.get('scrollToRoundNumber') : undefined;
      this.scrollTo.gameId = params.get('scrollToGameId') !== null ? +params.get('scrollToGameId') : undefined;
      this.scrollToEndRanking = params.get('scrollToId') !== null ? params.get('scrollToId') : undefined;
    });
    super.myNgOnInit(() => {
      this.setPlanningService();
    });
    this.showPrintBtn = true;
  }

  ngAfterViewChecked() {
    if (this.processing === false && this.scrollToEndRanking !== undefined) {
      this.scrollService.scrollTo({
        target: 'endranking',
        duration: 200
      });
      this.scrollToEndRanking = undefined;
    }
  }

  setPlanningService() {
    this.planningService = new PlanningService(this.tournament.getCompetition());
    this.userIsPlannerOrStructureAdmin = this.tournament.hasRole(this.authService.getLoggedInUserId(),
      Role.STRUCTUREADMIN + Role.PLANNER);

    this.processing = false;
  }

  linkToStructure() {
    this.router.navigate(['/toernooi/structure', this.tournament.getId()],
      {
        queryParams: {
          returnAction: '/toernooi/games',
          returnParam: this.tournament.getId(),
          returnQueryParamKey: 'scrollToId',
          returnQueryParamValue: 'endranking'
        }
      }
    );
  }
}

