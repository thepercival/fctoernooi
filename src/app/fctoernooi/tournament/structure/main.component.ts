import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeep } from 'lodash';
import {
  PlanningRepository,
  PlanningService,
  Round,
  RoundNumber,
  Structure,
  StructureRepository,
  Team,
  TeamRepository,
} from 'ngx-sport';

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
  changedRoundNumber: RoundNumber;
  originalTeams: Team[];
  clonedStructure: Structure;

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
      this.clonedStructure = this.createClonedStructure();
      this.processing = false;
      if (this.isHelpModalShownOnDevice() === false) {
        this.openHelp();
      }
    });
  }

  createClonedStructure(): Structure {
    this.originalTeams = this.structure.getRootRound().getTeams();
    return cloneDeep(this.structure);
  }

  processUnusedTeams(rootRound: Round) {
    const unusedTeams = this.teamRepository.getUnusedTeams(this.tournament.getCompetition());
    const oldTeams = this.originalTeams;
    const newTeams = rootRound.getTeams();

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
    const poulePlaces = rootRound.getPoulePlaces();
    poulePlaces.forEach((poulePlace) => {
      if (poulePlace.getTeam() === undefined) {
        poulePlace.setTeam(unusedTeams.shift());
      }
    });
  }

  setChangedRoundNumber(changedRoundNumber: RoundNumber) {
    if (this.changedRoundNumber !== undefined && changedRoundNumber.getNumber() > this.changedRoundNumber.getNumber()) {
      return;
    }
    this.changedRoundNumber = changedRoundNumber;
    this.resetAlert();
  }

  saveStructure() {
    this.processing = true;
    this.setAlert('info', 'wijzigingen worden opgeslagen');

    this.processUnusedTeams(this.structure.getRootRound());

    this.structureRepository.editObject(this.clonedStructure, this.tournament.getCompetition())
      .subscribe(
          /* happy path */ structureRes => {
          this.structure = structureRes;
          const planningService = new PlanningService(this.tournament.getCompetition());
          const tournamentService = new TournamentService(this.tournament);
          tournamentService.create(planningService, this.structure.getFirstRoundNumber());
          const changedRoundsForPlanning: Round[] = this.changedRoundNumber.getRounds();
          if (changedRoundsForPlanning.length === 0) {
            this.completeSave();
            return;
          }
          this.planningRepository.createObject(changedRoundsForPlanning)
            .subscribe(
                    /* happy path */ games => {
                this.completeSave();
              },
                  /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                  /* onComplete */() => this.processing = false
            );
        },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
      );
  }

  completeSave() {
    this.clonedStructure = this.createClonedStructure();
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
