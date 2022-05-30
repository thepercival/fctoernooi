import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BalancedPouleStructure,
  Category,
  CompetitionSportService,
  Competitor,
  PlaceRanges,
  Round,
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
import { CategoryNameChecker } from '../../lib/ngx-sport/category/nameChecker';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { CategoryChooseModalComponent } from '../../shared/tournament/category/chooseModal.component';
import { Favorites } from '../../lib/favorites';
import { TournamentScreen } from '../../shared/tournament/screenNames';
@Component({
  selector: 'app-tournament-structure',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class StructureEditComponent extends TournamentComponent implements OnInit {
  lastAction: StructureAction | undefined;
  actions: StructureAction[] = [];
  originalCompetitors!: Competitor[];
  clonedStructure!: Structure;
  public favorites!: Favorites;
  public favoriteCategories!: Category[];
  public structureNameService!: StructureNameService;
  private scrolled = false;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    structureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    public structureEditor: StructureEditor,
    private planningRepository: PlanningRepository,
    private competitionSportService: CompetitionSportService,
    private myNavigation: MyNavigation,
    private defaultService: DefaultService
  ) {
    super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
  }

  ngOnInit() {
    const noStructure = true;
    super.myNgOnInit(() => {
      this.structureEditor.setPlaceRanges(this.getPlaceRanges());
      this.structureRepository.getObject(this.tournament)
        .subscribe({
          next: (structure: Structure) => {
            this.structure = structure;

            // console.log(this.structure);
            this.clonedStructure = this.createClonedStructure(this.structure);
            this.updateFavoriteCategories(this.clonedStructure);
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

  get StructureScreen(): TournamentScreen { return TournamentScreen.Structure }

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

  getCategoryFavoritesActiveClass(): string {
    return this.isCategoryFilterActive() ? 'primary' : 'secondary';
  }

  isCategoryFilterActive(): boolean {
    return this.favorites.hasCategories() && this.favoriteCategories.length > 0
  }

  private addCategory(name: string) {
    if ((new CategoryNameChecker()).doesNameExists(this.clonedStructure.getCategories(), name)) {
      this.setAlert(IAlertType.Danger, 'de category-naam bestaat al');
      return;
    }
    // this.addAction(new StructureAction( StructureActionName.AddCategory)

    const category = this.structureEditor.addCategory(
      name, this.clonedStructure.getCategories().length + 1,
      this.clonedStructure.getFirstRoundNumber(),
      new BalancedPouleStructure(...this.defaultService.getPouleStructure(this.competition.getSportVariants()))
    );
    this.clonedStructure.getCategories().push(category);

    if (this.isCategoryFilterActive()) {
      this.favorites.addCategory(category);
      this.favRepository.editObject(this.favorites);
    }
    this.updateFavoriteCategories(this.clonedStructure);
    this.addAction({ name: StructureActionName.AddCategory, recreateStructureNameService: true });
  }

  public updateCategoryName(updateAction: UpdateCategoryNameAction) {
    if ((new CategoryNameChecker()).doesNameExists(this.clonedStructure.getCategories(), updateAction.newName, updateAction.category)) {
      this.setAlert(IAlertType.Danger, 'de category-naam bestaat al');
      return;
    }
    updateAction.category.setName(updateAction.newName);

    this.updateFavoriteCategories(this.clonedStructure);

    this.addAction({ name: StructureActionName.UpdateCategory, recreateStructureNameService: false });
  }

  public moveCategoryUp(category: Category): void {
    const previousCategory = this.getPreviousCategory(category)

    const newNr = category.getNumber();
    category.setNumber(previousCategory.getNumber());

    previousCategory.setNumber(newNr);

    const categories = this.clonedStructure.getCategories();
    const idx = categories.indexOf(category);
    const idxPrev = categories.indexOf(previousCategory);

    if (idx >= 0 && idxPrev >= 0) {
      var tmp = categories[idx];
      categories[idx] = categories[idxPrev];
      categories[idxPrev] = tmp;
    }

    this.updateFavoriteCategories(this.clonedStructure);
    this.addAction({ name: StructureActionName.UpdateCategory, recreateStructureNameService: true });
  }

  private getPreviousCategory(category: Category): Category {
    const previous = this.clonedStructure.getCategories().find((categoryIt: Category) => {
      return categoryIt.getNumber() === (category.getNumber() - 1);
    });
    if (previous === undefined) {
      throw new Error('no previous round');
    }
    return previous;
  }

  public removeCategory(category: Category): void {
    const categories = this.clonedStructure.getCategories();
    const idx = categories.indexOf(category);
    if (idx >= 0) {
      categories.splice(idx, 1);
    }
    categories.slice().splice(idx).forEach((category: Category) => {
      category.setNumber(category.getNumber() - 1);
    });
    this.removeCategoryRoundsFromRoundNumber([category.getRootRound()]);

    this.updateFavoriteCategories(this.clonedStructure);
    // this.clonedStructure.getCategories().forEach(category => category.getRootRound().getPoules().forEach(poule => {
    //   console.log(poule.getStructureLocation(), this.structureNameService.getPouleLetter(poule));
    // }));
    // console.log('removeCategory', this.clonedStructure);

    this.addAction({ name: StructureActionName.RemoveCategory, recreateStructureNameService: true });
  }

  private removeCategoryRoundsFromRoundNumber(rounds: Round[]): void {
    rounds.forEach((round: Round) => {
      this.removeCategoryRoundsFromRoundNumber(round.getChildren());
      round.detach();
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

  // ngAfterViewChecked() {
  //   if (this.roundElRef !== undefined && !this.processing && !this.scrolled) {
  //     this.scrolled = true;
  //     this.roundElRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }
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

export interface UpdateCategoryNameAction {
  category: Category;
  newName: string;
}



