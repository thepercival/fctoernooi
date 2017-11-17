import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { TournamentComponent } from '../component';
import { StructureRepository } from 'voetbaljs/structure/repository';

@Component({
  selector: 'app-tournament-structure',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class TournamentStructureComponent extends TournamentComponent implements OnInit {

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    super.myNgOnInit();
  }
}
