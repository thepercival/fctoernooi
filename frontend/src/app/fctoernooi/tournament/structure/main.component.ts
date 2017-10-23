import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { TournamentComponent } from '../component';
import { RoundRepository } from 'voetbaljs/round/repository';

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
      roundRepository: RoundRepository
  ) {
      super( route, router, tournamentRepository, roundRepository );
  }

  ngOnInit() {
    super.myNgOnInit();
  }
}