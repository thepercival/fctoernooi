import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import {
  PlanningRepository,
  PlanningService,
  Round,
  StructureRepository,
  StructureService,
  Team,
  TeamRepository,
} from 'ngx-sport';

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

  processing = true;
  processed = false;
  isChanged = false;
  alert: IAlert;
  originalTeams: Team[];

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    private teamRepository: TeamRepository
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.structureService = this.createStructureServiceCopy(this.structureService.getFirstRound());
      this.processing = false;
    });
  }

  createStructureServiceCopy(firstRound: Round): StructureService {
    this.originalTeams = firstRound.getTeams();
    const deepCopyOfFirstRound = cloneDeep(firstRound);
    return new StructureService(
      this.tournament.getCompetition(),
      { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS },
      deepCopyOfFirstRound
    );
  }

  createStructureService(firstRound: Round): StructureService {
    return new StructureService(
      this.tournament.getCompetition(),
      { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS },
      firstRound
    );
  }

  processUnusedTeams(firstRound: Round) {
    const unusedTeams = this.teamRepository.getUnusedTeams(this.tournament.getCompetition());
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
    this.structureRepository.editObject(firstRound, this.tournament.getCompetition())
      .subscribe(
          /* happy path */ roundRes => {
          this.structureService = this.createStructureService(roundRes);
          const planningService = new PlanningService(this.structureService);
          planningService.create(roundRes.getNumber());

          this.planningRepository.createObject([roundRes])
            .subscribe(
                    /* happy path */ games => {
                console.log(roundRes);
                this.structureService = this.createStructureServiceCopy(roundRes);

                // prob send to childs again?
                this.isChanged = false;
                this.processed = true;
                this.processing = false;
              },
                  /* error path */ e => { this.setAlert('danger', e); },
                  /* onComplete */() => this.processing = false
            );
        },
        /* error path */ e => { this.setAlert('danger', e); }
      );
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }
}
