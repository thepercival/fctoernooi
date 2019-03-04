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
  Competitor,
  CompetitorRepository,
} from 'ngx-sport';

import { TournamentComponent } from '../component';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';
import { TournamentStructureHelpModalComponent } from './helpmodal.component';

@Component({
  selector: 'app-tournament-structure',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class TournamentStructureComponent extends TournamentComponent implements OnInit {
  changedRoundNumber: RoundNumber;
  originalCompetitors: Competitor[];
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
    private competitorRepository: CompetitorRepository,
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
    this.originalCompetitors = structure.getRootRound().getCompetitors();
    return cloneDeep(structure);
  }

  processUnusedCompetitors(rootRound: Round) {
    const unusedCompetitors = this.competitorRepository.getUnusedCompetitors(this.tournament.getCompetition());
    const oldCompetitors = this.originalCompetitors;
    const newCompetitors = rootRound.getCompetitors();

    // add competitors which are not used anymore to unusedcompetitors
    oldCompetitors.forEach(oldCompetitor => {
      if (newCompetitors.find(newCompetitor => newCompetitor.getId() === oldCompetitor.getId()) === undefined
        && unusedCompetitors.find(unusedCompetitor => unusedCompetitor.getId() === oldCompetitor.getId()) === undefined
      ) {
        unusedCompetitors.push(oldCompetitor);
      }
    });

    // remove competitors which are used again
    unusedCompetitors.forEach(unusedCompetitor => {
      if (newCompetitors.find(newCompetitor => newCompetitor.getId() === unusedCompetitor.getId()) !== undefined) {
        const index = unusedCompetitors.indexOf(unusedCompetitor);
        if (index > -1) {
          unusedCompetitors.splice(index, 1);
        }
      }
    });

    // add an unused Competitor if there are places without a Competitor
    const poulePlaces = rootRound.getPoulePlaces();
    poulePlaces.forEach((poulePlace) => {
      if (poulePlace.getCompetitor() === undefined) {
        poulePlace.setCompetitor(unusedCompetitors.shift());
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

    this.processUnusedCompetitors(this.clonedStructure.getRootRound());

    this.structureRepository.editObject(this.clonedStructure, this.tournament.getCompetition())
      .subscribe(
          /* happy path */ structureRes => {
          // if (this.changedRoundNumber === undefined) {
          //   return this.completeSave(structureRes);
          // }
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
    // let changedRoundNumber = structure.getRoundNumber(roundNumberToSync);
    // if (changedRoundNumber === undefined) {
    //   return this.completeSave(structure);
    // }

    // first better test creating planning in php!!
    const changedRoundNumber = structure.getFirstRoundNumber();

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
