import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BalancedPouleStructure,
  Category,
  CompetitionSportService,
  Competitor,
  NameService,
  PlaceRanges,
  StartLocationMap,
  Structure,
  StructureEditor,
  StructureNameService
} from 'ngx-sport';

import { cloneDeep } from 'lodash';
import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { IAlertType } from '../../shared/common/alert';
import { QualifyPathNode } from 'ngx-sport';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NameModalComponent } from '../../shared/tournament/namemodal/namemodal.component';
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
  public structureNameService!: StructureNameService;
  private scrolled = false;

  @ViewChild('structureRound') private roundElRef: ElementRef | undefined;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    public structureEditor: StructureEditor,
    private modalService: NgbModal,
    private planningRepository: PlanningRepository,
    private competitionSportService: CompetitionSportService,
    private myNavigation: MyNavigation,
    private defaultService: DefaultService
  ) {
    super(route, router, tournamentRepository, structureRepository, globalEventsManager);
  }

  ngOnInit() {
    const noStructure = true;
    super.myNgOnInit(() => {
      this.structureEditor.setPlaceRanges(this.getPlaceRanges());
      this.structureRepository.getObject(this.tournament)
        .subscribe({
          next: (structure: Structure) => {
            this.structure = structure;
            console.log(this.structure);
            this.clonedStructure = this.createClonedStructure(this.structure);
            this.structureNameService = new StructureNameService(new StartLocationMap(this.originalCompetitors));
            this.processing = false;
          },
          error: (e: string) => {
            const sportVariant = this.competition.getSingleSport().getVariant();
            const pouleStructure = this.defaultService.getPouleStructure([sportVariant]);
            const jsonPlanningConfig = this.defaultService.getJsonPlanningConfig(sportVariant);
            this.structure = this.structureEditor.create(this.competition, pouleStructure, jsonPlanningConfig);
            this.clonedStructure = this.createClonedStructure(this.structure);
            this.structureNameService = new StructureNameService(new StartLocationMap(this.originalCompetitors));
            this.setAlert(IAlertType.Danger, e + ', new structure created');
            this.processing = false;
          }
        });
    }, noStructure);
  }

  openCategoryModal(category?: Category) {
    const activeModal = this.modalService.open(NameModalComponent);
    activeModal.componentInstance.header = 'categorie';
    activeModal.componentInstance.range = { min: 3, max: 15 };
    activeModal.componentInstance.placeHolder = 'Jongens 7/8';
    activeModal.componentInstance.labelName = 'naam';
    activeModal.componentInstance.buttonName = category ? 'wijzigen' : 'toevoegen';

    activeModal.result.then((categoryName: string) => {
      this.addCategory(categoryName);
    }, (reason) => {
    });
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
    if (structureAction.recreateStructureNameService) {
      this.structureNameService = new StructureNameService();
    }
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

  private addCategory(name: string) {
    // this.addAction(new StructureAction( StructureActionName.AddCategory)

    const catergory = this.structureEditor.addCategory(
      name, this.clonedStructure.getCategories().length + 1,
      this.clonedStructure.getFirstRoundNumber(),
      new BalancedPouleStructure(...this.defaultService.getPouleStructure(this.competition.getSportVariants()))
    );
    this.clonedStructure.getCategories().push(catergory);
    this.addAction({ name: StructureActionName.AddCategory, recreateStructureNameService: true });
  }

  public removeCategory(category: Category): void {
    const categories = this.clonedStructure.getCategories();
    const idx = categories.indexOf(category);
    if (idx >= 0) {
      categories.splice(idx, 1);
    }
    categories.slice().splice(idx).forEach((category: Category) => {
      console.log(category);
      category.setNumber(category.getNumber() - 1);
    });
    this.addAction({ name: StructureActionName.RemoveCategory, recreateStructureNameService: true });
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
  name: StructureActionName;
  pathNode?: QualifyPathNode;
  initialMaxNrOfPoulePlaces?: number;
  recreateStructureNameService: boolean;
}

export enum StructureActionName {
  AddCategory, RemoveCategory, UpdateCategory, // categoryActions
  AddPouleToRootRound, RemovePouleFromRootRound, AddPlaceToRootRound, // roundActions
  RemovePlaceFromRootRound, IncrementNrOfPoules, DecrementNrOfPoules, // roundActions
  RemoveQualifier, AddQualifier, // qualifyActions
  SplitQualifyGroupsFrom, MergeQualifyGroupWithNext // qualifyActions
}

