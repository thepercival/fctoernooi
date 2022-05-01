import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CompetitionSportService,
  Competitor,
  CompetitorMap,
  NameService,
  PlaceRanges,
  Structure,
  StructureEditor
} from 'ngx-sport';

import { cloneDeep } from 'lodash';
import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { IAlertType } from '../../shared/common/alert';
import { StructurePathNode } from 'ngx-sport';
@Component({
  selector: 'app-tournament-structure',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class StructureEditComponent extends TournamentComponent implements OnInit, AfterViewChecked {
  lastAction: StructureAction | undefined;
  actions: StructureAction[] = [];
  originalCompetitors!: Competitor[];
  clonedStructure!: Structure;
  public nameService!: NameService;
  private scrolled = false;

  @ViewChild('structureRound') private roundElRef: ElementRef | undefined;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    public structureEditor: StructureEditor,
    private planningRepository: PlanningRepository,
    private competitionSportService: CompetitionSportService,
    private myNavigation: MyNavigation,
    private defaultService: DefaultService
  ) {
    super(route, router, tournamentRepository, structureRepository);
  }

  ngOnInit() {
    const noStructure = true;
    super.myNgOnInit(() => {
      this.nameService = new NameService(new CompetitorMap(this.tournament.getCompetitors()));
      this.structureEditor.setPlaceRanges(this.getPlaceRanges());
      this.structureRepository.getObject(this.tournament)
        .subscribe({
          next: (structure: Structure) => {
            this.structure = structure;
            this.clonedStructure = this.createClonedStructure(this.structure);
            this.processing = false;
          },
          error: (e: string) => {
            const sportVariant = this.competition.getSingleSport().getVariant();
            const pouleStructure = this.defaultService.getPouleStructure([sportVariant]);
            const jsonPlanningConfig = this.defaultService.getJsonPlanningConfig(sportVariant);
            this.structure = this.structureEditor.create(this.competition, pouleStructure, jsonPlanningConfig);
            this.clonedStructure = this.createClonedStructure(this.structure);
            this.setAlert(IAlertType.Danger, e + ', new structure created');
            this.processing = false;
          }
        });
    }, noStructure);
  }

  protected getPlaceRanges(): PlaceRanges {
    const sportVariants = this.competition.getSportVariants();
    const minNrOfPlacesPerPoule = this.competitionSportService.getMinNrOfPlacesPerPoule(sportVariants);
    const maxNrOfPlacesPerPouleSmall = 20;
    const maxNrOfPlacesPerPouleLarge = 12;
    const minNrOfPlacesPerRound = minNrOfPlacesPerPoule;
    const maxNrOfPlacesPerRoundSmall = 40;
    const maxNrOfPlacesPerRoundLarge = 128;
    return new PlaceRanges(
      minNrOfPlacesPerPoule, maxNrOfPlacesPerPouleSmall, maxNrOfPlacesPerPouleLarge,
      minNrOfPlacesPerRound, maxNrOfPlacesPerRoundSmall, maxNrOfPlacesPerRoundLarge
    );
  }

  createClonedStructure(structure: Structure): Structure {
    this.originalCompetitors = this.tournament.getCompetitors();
    return cloneDeep(structure);
    /** CDK @TODO NODE 18 */
    // return structuredClone(structure);
  }

  addAction(structureAction: StructureAction) {
    this.lastAction = structureAction;
    this.actions.push(structureAction);
    //console.log(this.actions);
    // (new StructureOutput()).toConsole(this.clonedStructure, console);
    this.resetAlert();
  }

  // getLowestRoundNumberFromActions(structurePathNode: StructurePathNode): number {
  //   if( this.actions)
  //   return Math.min(...arrayOfNumbers);
  //   return structurePathNode.getLevel();
  // }

  saveStructure() {
    this.processing = true;
    this.setAlert(IAlertType.Info, 'wijzigingen worden opgeslagen');

    this.structureRepository.editObject(this.clonedStructure, this.tournament)
      .subscribe({
        next: (structureRes: Structure) => {
          this.syncPlanning(structureRes, 1/*this.getLowestLevelAction()*/); // should always be first roundnumber
        },
        error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
      });
  }

  completeSave(structureRes: Structure) {
    // const newClonedStructure = this.createClonedStructure(structureRes);
    // console.log((new StructureOutput()).createGrid(structureRes).equalsGrid(
    //   (new StructureOutput()).createGrid(this.clonedStructure)
    // ));
    this.clonedStructure = this.createClonedStructure(structureRes);
    this.actions = [];
    this.processing = false;
    this.setAlert(IAlertType.Success, 'de wijzigingen zijn opgeslagen');
  }

  protected syncPlanning(structure: Structure, roundNumberToSync: number) {
    let changedRoundNumber = structure.getRoundNumber(roundNumberToSync);
    if (changedRoundNumber === undefined) {
      return this.completeSave(structure);
    }
    this.planningRepository.create(structure, this.tournament, roundNumberToSync)
      .subscribe({
        next: () => this.completeSave(structure),
        error: e => { this.setAlert(IAlertType.Danger, e); this.processing = false; },
        complete: () => this.processing = false
      });
  }

  navigateBack() {
    this.myNavigation.back();
  }

  ngAfterViewChecked() {
    if (this.roundElRef !== undefined && !this.processing && !this.scrolled) {
      this.scrolled = true;
      this.roundElRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

export interface StructureAction {
  path: StructurePathNode;
  name: StructureActionName;
  initialMaxNrOfPoulePlaces?: number;
}

export enum StructureActionName {
  AddPouleToRootRound, RemovePouleFromRootRound, AddPlaceToRootRound, // roundActions
  RemovePlaceFromRootRound, IncrementNrOfPoules, DecrementNrOfPoules, // roundActions
  RemoveQualifier, AddQualifier, // qualifyActions
  SplitQualifyGroupsFrom, MergeQualifyGroupWithNext // qualifyActions
}

