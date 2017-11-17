import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { TournamentComponent } from '../component';
import { StructureRepository } from 'voetbaljs/structure/repository';
import { IAlert } from '../../../app.definitions';

@Component({
  selector: 'app-tournament-planning',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class TournamentPlanningComponent extends TournamentComponent implements OnInit {

  settingsAlert: IAlert;

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
    super.myNgOnInit();
  }
}
