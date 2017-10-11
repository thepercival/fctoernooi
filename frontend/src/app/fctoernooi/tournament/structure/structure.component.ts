import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { Tournament } from '../../tournament';
import { TournamentComponent } from '../component';
import { RoundRepository } from 'voetbaljs/round/repository';

@Component({
  selector: 'app-tournament-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.css']
})
export class TournamentStructureComponent extends TournamentComponent {

  constructor(
      route: ActivatedRoute,
      router: Router,
      tournamentRepository: TournamentRepository,
      roundRepository: RoundRepository
  ) {
      super( route, router, tournamentRepository, roundRepository );
  }



}
