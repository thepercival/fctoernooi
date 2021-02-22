import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Competitor,
  RoundNumber,
  Structure,
  PlaceLocationMap,
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-tournament-structure',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class StructureEditComponent extends TournamentComponent implements OnInit {
  changedRoundNumber: RoundNumber | undefined;
  originalCompetitors!: Competitor[];
  clonedStructure!: Structure;
  public placeLocationMap!: PlaceLocationMap;

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
    private myNavigation: MyNavigation
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.placeLocationMap = new PlaceLocationMap(this.tournament.getCompetitors());
      this.clonedStructure = this.createClonedStructure(this.structure);
      this.processing = false;
    });
  }

  createClonedStructure(structure: Structure): Structure {
    this.originalCompetitors = this.tournament.getCompetitors();
    return cloneDeep(structure);
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

    this.structureRepository.editObject(this.clonedStructure, this.tournament)
      .subscribe(
          /* happy path */ structureRes => {
          // should always be first roundnumber
          this.syncPlanning(structureRes, 1/*this.changedRoundNumber.getNumber()*/);
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
    let changedRoundNumber = structure.getRoundNumber(roundNumberToSync);
    if (changedRoundNumber === undefined) {
      return this.completeSave(structure);
    }
    this.planningRepository.create(structure, this.tournament, roundNumberToSync)
      .subscribe(
          /* happy path */ roundNumberOut => this.completeSave(structure),
          /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
          /* onComplete */() => this.processing = false
      );
  }

  navigateBack() {
    this.myNavigation.back();
  }
}
