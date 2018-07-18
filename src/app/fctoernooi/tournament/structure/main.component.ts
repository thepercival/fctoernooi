import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

import { Tournament } from '../../tournament';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';
import { TournamentService } from '../service';
import { TournamentStructureHelpModalComponent } from './helpmodal.component';

@Component({
  selector: 'app-tournament-structure',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class TournamentStructureComponent extends TournamentComponent implements OnInit {
  changedRoundNumber;
  originalTeams: Team[];

  uiSliderConfigExample: any = {
    behaviour: 'drag',
    margin: 1,
    step: 1,
    start: 1
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    private teamRepository: TeamRepository,
    private modalService: NgbModal
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.structureService = this.createStructureServiceCopy(this.structureService.getFirstRound());
      this.processing = false;
      console.log(this.isHelpModalShownOnDevice());
      if (this.isHelpModalShownOnDevice() === false) {
        this.openHelp();
      }
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

  setChangedRoundNumber(changedRoundNumber) {
    if (this.changedRoundNumber !== undefined && changedRoundNumber > this.changedRoundNumber) {
      return;
    }
    this.changedRoundNumber = changedRoundNumber;
    this.resetAlert();
  }

  saveStructure() {
    this.processing = true;
    this.setAlert('info', 'wijzigingen worden opgeslagen');

    const firstRound = this.structureService.getFirstRound();
    this.processUnusedTeams(firstRound);

    this.structureRepository.editObject(firstRound, this.tournament.getCompetition())
      .subscribe(
          /* happy path */ roundRes => {
          this.structureService = this.createStructureService(roundRes);
          const planningService = new PlanningService(this.structureService);
          const tournamentService = new TournamentService(this.tournament);
          tournamentService.create(planningService, roundRes.getNumber());
          const changedRoundsForPlanning: Round[] = planningService.getRoundsByNumber(this.changedRoundNumber);
          if (changedRoundsForPlanning === undefined) {
            this.completeSave(roundRes);
            return;
          }
          this.planningRepository.createObject(changedRoundsForPlanning)
            .subscribe(
                    /* happy path */ games => {
                this.completeSave(roundRes);
              },
                  /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                  /* onComplete */() => this.processing = false
            );
        },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
      );
  }

  completeSave(round: Round) {
    this.structureService = this.createStructureServiceCopy(round);
    this.changedRoundNumber = undefined;
    this.processing = false;
    this.setAlert('success', 'de wijzigingen zijn opgeslagen');
  }

  isHelpModalShownOnDevice() {
    let helpModalShownOnDevice = localStorage.getItem('helpmodalshown');
    if (helpModalShownOnDevice === null) {
      helpModalShownOnDevice = 'false';
    }
    return JSON.parse(helpModalShownOnDevice);
  }

  helpModalShownOnDevice() {
    localStorage.setItem('helpmodalshown', JSON.stringify(true));
  }

  openHelp() {
    this.modalService.open(TournamentStructureHelpModalComponent).result.then((result) => {
      this.helpModalShownOnDevice();
    }, (reason) => {
      this.helpModalShownOnDevice();
    });
  }
}
