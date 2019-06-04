import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import {
  Competitor,
  CompetitorRepository,
  PlanningRepository,
  PlanningService,
  Round,
  RoundNumber,
  Structure,
  StructureRepository,
} from 'ngx-sport';

import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';
import { TournamentComponent } from '../component';

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

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    private competitorRepository: CompetitorRepository,
    private myNavigation: MyNavigation
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.clonedStructure = this.createClonedStructure(this.structure);
      this.processing = false;
    });
  }

  createClonedStructure(structure: Structure): Structure {
    this.originalCompetitors = structure.getFirstRoundNumber().getCompetitors();
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
    const places = rootRound.getPlaces();
    places.forEach((place) => {
      if (place.getCompetitor() === undefined) {
        place.setCompetitor(unusedCompetitors.shift());
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

  navigateBack() {
    this.myNavigation.back();
  }
}