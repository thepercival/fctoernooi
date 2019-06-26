import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StructureRepository } from 'ngx-sport';

import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';

@Component({
  selector: 'app-tournament-structure-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class StructureViewComponent extends TournamentComponent implements OnInit {

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    private myNavigation: MyNavigation,
    structureRepository: StructureRepository
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.processing = false;
    });
  }

  navigateBack() {
    this.myNavigation.back();
  }
}
