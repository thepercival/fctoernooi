import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StructureRepository, RoundNumber, PlanningRepository } from 'ngx-sport';

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
      this.processing = false;
    });
    this.showPrintBtn = true;
  }

  scroll() {
    this.myNavigation.scroll();
  }

  linkToStructure() {
    this.router.navigate(['/toernooi/structure', this.tournament.getId()]
    );
  }

  updatePlanning(roundNumber: RoundNumber) {
    console.log('update planning for roundnumber ' + roundNumber.getNumber());
    this.processing = true;
    this.planningRepository.createObject(roundNumber, this.tournament.getBreak())
      .subscribe(
          /* happy path */ roundNumberOut => roundNumber = roundNumberOut,
          /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
          /* onComplete */() => this.processing = false
      );
  }
}

