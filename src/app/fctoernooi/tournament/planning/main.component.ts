import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { PlanningService, Round, StructureRepository, StructureService } from 'ngx-sport';

import { IAlert } from '../../../app.definitions';
import { Tournament } from '../../tournament';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';

@Component({
  selector: 'app-tournament-planning',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class TournamentPlanningComponent extends TournamentComponent implements OnInit {

  initalTabId: string;
  settingsAlert: IAlert;
  planningService: PlanningService;
  showPrintBtn: boolean;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository
  ) {
    super(route, router, tournamentRepository, structureRepository);
    this.settingsAlert = { 'type': 'info', 'message': 'wijzigingen worden ook verwerkt op volgende rondes' };
  }

  ngOnInit() {
    super.myNgOnInit(() => this.setPlanningService());

    this.initalTabId = 'tab-view';
    this.showPrintBtn = true;
    this.route.queryParamMap.subscribe(params => {
      if (params.get('tabid') !== null) {
        this.initalTabId = params.get('tabid');
        this.showPrintBtn = (this.initalTabId === 'tab-view');
      }
    });
  }

  setPlanningService() {
    this.planningService = new PlanningService(this.structureService);
  }

  updateRound(newRound: Round) {
    this.structureService = new StructureService(
      this.tournament.getCompetitionseason(),
      { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS },
      newRound
    );
    this.setPlanningService();
  }

  public beforeChange($event: NgbTabChangeEvent) {
    this.showPrintBtn = ($event.nextId === 'tab-view');
  }

  printPdf() {
    const url = this.tournamentRepository.getUrl() + '/pdf/' + this.tournament.getId();
    const newWindow = window.open(url);
  }
}

