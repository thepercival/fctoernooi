import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import { Round, StructureRepository, StructureService, Team, TeamRepository } from 'ngx-sport';

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
  originalTeams: Team[];

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    private teamRepository: TeamRepository
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.createStructureService(this.structureService.getFirstRound()));
  }

  createStructureService(firstRound: Round): StructureService {
    this.originalTeams = firstRound.getTeams();
    const deepCopyOfFirstRound = cloneDeep(firstRound);
    return new StructureService(
      this.tournament.getCompetitionseason(),
      { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS },
      deepCopyOfFirstRound
    );
  }

  processUnusedTeams(firstRound: Round) {
    const unusedTeams = this.teamRepository.getUnusedTeams(this.tournament.getCompetitionseason());
    const oldTeams = this.originalTeams;
    const newTeams = firstRound.getTeams();

    // add teams which are not used anymore to unusedteams
    oldTeams.forEach(oldTeam => {
      if (newTeams.find(newTeam => newTeam.getId() === oldTeam.getId()) === undefined
        && unusedTeams.find(unusedTeam => unusedTeam.getId() === oldTeam.getId()) === undefined
      ) {
        unusedTeams.push(oldTeam);
      }
    });

    // remove teams which are used again
    unusedTeams.forEach(unusedTeam => {
      if (newTeams.find(newTeam => newTeam.getId() === unusedTeam.getId()) !== undefined) {
        const index = unusedTeams.indexOf(unusedTeam);
        if (index > -1) {
          unusedTeams.splice(index, 1);
        }
      }
    });

    // add an unused team if there are places without a team
    const poulePlaces = firstRound.getPoulePlaces();
    poulePlaces.forEach((poulePlace) => {
      if (poulePlace.getTeam() === undefined) {
        poulePlace.setTeam(unusedTeams.shift());
      }
    });
  }

  saveStructure() {
    this.processing = true;

    const firstRound = this.structureService.getFirstRound();
    this.processUnusedTeams(firstRound);
    this.structureRepository.editObject(firstRound, this.tournament.getCompetitionseason())
      .subscribe(
          /* happy path */ roundRes => {
        this.structureService = this.createStructureService(roundRes);

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
