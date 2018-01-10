import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from 'voetbaljs/game';
import { Round } from 'voetbaljs/round';
import { StructureRepository } from 'voetbaljs/structure/repository';
import { StructureService } from 'voetbaljs/structure/service';

import { IAlert } from '../../../app.definitions';
import { Tournament } from '../../tournament';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';

@Component({
  selector: 'app-tournament-structure',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class TournamentStructureComponent extends TournamentComponent implements OnInit {

  processing = false;
  processed = false;
  isChanged = false;
  alert: IAlert;

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

  saveStructure() {
    this.processing = true;

    const firstRound = this.structureService.getFirstRound();
    this.structureRepository.editObject(firstRound, firstRound.getCompetitionseason())
      .subscribe(
                        /* happy path */ roundRes => {
        this.structureService = new StructureService(
          this.tournament.getCompetitionseason(),
          { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS },
          roundRes
        );
        // prob send to childs again?
        this.isChanged = false;
        this.processed = true;
        this.processing = false;

      },
              /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
              /* onComplete */() => this.processing = false
      );
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }
}
