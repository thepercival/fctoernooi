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
import { TournamentRepository } from '../../../lib/tournament/repository';
import { TournamentService } from '../../../lib/tournament/service';
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
  private returnUrl: string;
  private returnUrlParam: string;
  private returnUrlQueryParamKey: string;
  private returnUrlQueryParamValue: string;

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

    this.route.queryParamMap.subscribe(params => {
      this.returnUrl = params.get('returnAction') !== null ? params.get('returnAction') : undefined;
      this.returnUrlParam = +params.get('returnParam') !== null ? params.get('returnParam') : undefined;
      this.returnUrlQueryParamKey = params.get('returnQueryParamKey') !== null ? params.get('returnQueryParamKey') : undefined;
      this.returnUrlQueryParamValue = params.get('returnQueryParamValue') !== null ? params.get('returnQueryParamValue') : undefined;
  });
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.clonedStructure = this.createClonedStructure(this.structure);
      this.processing = false;
      if (this.isHelpModalShownOnDevice() === false) {
        this.openHelp();
      }
    });
  }

  createClonedStructure(structure: Structure): Structure {
    this.originalTeams = structure.getRootRound().getTeams();
    return cloneDeep(structure);
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

    this.processUnusedTeams(this.clonedStructure.getRootRound());

    this.structureRepository.editObject(this.clonedStructure, this.tournament.getCompetition())
      .subscribe(
          /* happy path */ structureRes => {
          if (this.changedRoundNumber === undefined) {
            return this.completeSave(structureRes);
          }
          this.syncPlanning(structureRes, this.changedRoundNumber.getNumber());
        },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
      );
  }

  completeSave(structureRes: Structure) {
    this.clonedStructure = this.createClonedStructure(structureRes);
    this.changedRoundNumber = undefined;
    this.processing = false;
    this.setAlert('success', 'de wijzigingen zijn opgeslagen');
  }

  protected syncPlanning(structure: Structure, roundNumberToSync: number) {
    const changedRoundNumber = structure.getRoundNumber(roundNumberToSync);
    if (changedRoundNumber === undefined) {
      return this.completeSave(structure);
    }
    const planningService = new PlanningService(this.tournament.getCompetition());
    const tournamentService = new TournamentService(this.tournament);
    tournamentService.create(planningService, changedRoundNumber);
    this.planningRepository.createObject(changedRoundNumber)
      .subscribe(
          /* happy path */ games => this.completeSave(structure),
          /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
          /* onComplete */() => this.processing = false
      );
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

  navigateBack() {
    let extras;
    if( this.returnUrlQueryParamKey !== undefined ) {
      extras = { queryParams: {} };
      extras.queryParams[this.returnUrlQueryParamKey] = this.returnUrlQueryParamValue;
    }
    this.router.navigate([this.returnUrl, this.returnUrlParam],extras);
  }
}
