import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService, StructureRepository } from 'ngx-sport';

import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';

@Component({
  selector: 'app-tournament-games',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class GameListComponent extends TournamentComponent implements OnInit {

  planningService: PlanningService;
  showPrintBtn: boolean;
  noRefresh = false;
  scrollToGameId: number;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.scrollToGameId = +params.get('scrollToGameId');
    });
    super.myNgOnInit(() => this.setPlanningService());
    this.showPrintBtn = true;
  }

  setPlanningService() {
    this.planningService = new PlanningService(this.structureService);
  }

  // updateRound(newRound: Round) {
  //   this.structureService = new StructureService(
  //     this.tournament.getCompetition(),
  //     { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS },
  //     newRound
  //   );
  //   this.setPlanningService();
  // }

  // public beforeChange($event: NgbTabChangeEvent) {
  //   this.showPrintBtn = ($event.nextId === 'tab-view');
  // }

  printPdf() {
    const url = this.tournamentRepository.getUrl() + '/pdf/' + this.tournament.getId();
    const newWindow = window.open(url);
  }
}

