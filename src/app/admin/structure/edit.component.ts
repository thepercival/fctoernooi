import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BalancedPouleStructure,
  Category,
  Competitor,
  JsonStructure,
  Round,
  StartLocationMap,
  Structure,
  StructureEditor,
  StructureMapper,
  StructureNameService
} from 'ngx-sport';

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
import { CategoryUniqueChecker } from '../../lib/ngx-sport/category/uniqueChecker';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { Favorites } from '../../lib/favorites';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { TournamentRegistrationRepository } from '../../lib/tournament/registration/repository';
import { TournamentRegistration } from '../../lib/tournament/registration';
import { CategoryModalComponent } from '../../shared/tournament/structure/categorymodal/categorymodal.component';

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
  clonedJsonStructure!: JsonStructure;
  public favorites!: Favorites;
  public structureNameService!: StructureNameService;
  public hasBegun: boolean = true;
  // private scrolled = false;

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
    private myNavigation: MyNavigation,
    private defaultService: DefaultService,
    private structureMapper: StructureMapper,
    private registrationRepository: TournamentRegistrationRepository
  ) {
    super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
  }

  ngOnInit() {
    const noStructure = true;
    super.myNgOnInit(() => {
      this.structureEditor.setPlaceRanges(this.defaultService.getPlaceRanges(this.competition.getSportVariants()));
      this.structureRepository.getObject(this.tournament)
        .subscribe({
          next: (structure: Structure) => {
            this.structure = structure;
            this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();

            // GAMES WORDEN NIET GECLONED
            this.clonedStructure = this.createClonedStructure(this.structure);
            this.clonedJsonStructure = this.structureMapper.toJson(this.clonedStructure);
            this.favorites = this.favRepository.getObject(this.tournament, this.clonedStructure.getCategories());
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
            this.hasBegun = this.clonedStructure.getFirstRoundNumber().hasBegun();
            this.updateFavoriteCategories(this.clonedStructure);
            this.structureNameService = new StructureNameService(new StartLocationMap(this.originalCompetitors));
            this.setAlert(IAlertType.Danger, e + ', new structure created');
            this.processing = false;
          }
        });
    }, noStructure);
  }

  get StructureScreen(): TournamentScreen { return TournamentScreen.Structure }

  openAddCategoryModal() {
    const activeModal = this.modalService.open(CategoryModalComponent);
    activeModal.componentInstance.categories = this.clonedStructure.getCategories();
    activeModal.componentInstance.buttonLabel = 'toevoegen';

    activeModal.result.then((categoryProperties: CategoryProperties) => {
      this.addCategory(categoryProperties.newName, categoryProperties.newAbbreviation);
    }, (reason) => {
    });
  }

  createClonedStructure(structure: Structure): Structure {
    this.originalCompetitors = this.tournament.getCompetitors();
    const jsonStructure = this.structureMapper.toJson(structure);
    
    const copiedStructure = this.structureMapper.toObject(jsonStructure, this.tournament.getCompetition());
    // console.log(jsonStructure, ' to object', copiedStructure);
    return copiedStructure
  }

  addAction(structureAction: StructureAction) {
    this.lastAction = structureAction;
    this.actions.push(structureAction);

    // if (structureAction.name === StructureActionName.AddQualifier) {
    //   console.log('AddQualifier');
    //   console.log(this.clonedStructure.getCategory(2).getRootRound());
    // }
    // (new StructureOutput()).toConsole(this.clonedStructure, console);
    // console.log('addAction(post)  has child', .getBorderQualifyGroup(QualifyTarget.Winners) !== undefined);
    this.resetAlert();
    if (structureAction.recreateStructureNameService) {
      this.structureNameService = new StructureNameService();
    }
    this.clonedJsonStructure = this.structureMapper.toJson(this.clonedStructure);
    console.log('structure', this.clonedStructure);
    console.log('jsonStructure', this.clonedStructure);
  }

  // getLowestRoundNumberFromActions(structurePathNode: StructurePathNode): number {
  //   if( this.actions)
  //   return Math.min(...arrayOfNumbers);
  //   return structurePathNode.getLevel();
  // }

  private addCategory(name: string, abbreviation: string|undefined) {
    if ((new CategoryUniqueChecker()).doesNameExists(this.clonedStructure.getCategories(), name)) {
      this.setAlert(IAlertType.Danger, 'de category-naam bestaat al');
      return;
    }
    // this.addAction(new StructureAction( StructureActionName.AddCategory)

    const category = this.structureEditor.addCategory(
      name, abbreviation, this.clonedStructure.getCategories().length + 1,
      this.clonedStructure.getFirstRoundNumber(),
      new BalancedPouleStructure(...this.defaultService.getPouleStructure(this.competition.getSportVariants()))
    );
    this.clonedStructure.getCategories().push(category);

    if (this.isCategoryFilterActive(this.clonedStructure)) {
      this.favorites.addCategory(category);
      this.favRepository.editObject(this.favorites);
    }
    this.updateFavoriteCategories(this.clonedStructure);
    this.addAction({ name: StructureActionName.AddCategory, recreateStructureNameService: true });
  }

  public updateCategory(category: Category, categoryProperties: CategoryProperties) {
    if ((new CategoryUniqueChecker()).doesNameExists(this.clonedStructure.getCategories(), categoryProperties.newName, category)) {
      this.setAlert(IAlertType.Danger, 'de category-naam bestaat al');
      return;
    }
    
    category.setName(categoryProperties.newName);
    category.setAbbreviation(categoryProperties.newAbbreviation);

    this.updateFavoriteCategories(this.clonedStructure);

    this.addAction({ name: StructureActionName.UpdateCategory, recreateStructureNameService: false });
  }

  public moveCategoryUp(category: Category): void {
    const previousCategory = this.getPreviousCategory(this.clonedStructure, category)

    
    this.structureEditor.switchCategories(this.clonedStructure, previousCategory, category);
    
    this.updateFavoriteCategories(this.clonedStructure);
    this.addAction({ name: StructureActionName.UpdateCategory, recreateStructureNameService: true });
  }

  private getPreviousCategory(structure: Structure, category: Category): Category {
    const previous = structure.getCategories().find((categoryIt: Category) => {
      return categoryIt.getNumber() === (category.getNumber() - 1);
    });
    if (previous === undefined) {
      throw new Error('no previous round');
    }
    return previous;
  }

  public removeCategory(category: Category): void {
    this.processing = true;
    this.registrationRepository.getObjects(category, this.tournament)
      .subscribe({
        next: (registrations: TournamentRegistration[]) => {
          if (registrations.length > 0) {
            this.setAlert(IAlertType.Warning, 'er zijn al inschrijvingen voor deze category');
            this.processing = false;
            return;  
          }
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
          this.processing = false;
        },
        error: (e: string) => {
          this.processing = false;
        }
      });
  }

  private removeCategoryRoundsFromRoundNumber(rounds: Round[]): void {
    rounds.forEach((round: Round) => {
      this.removeCategoryRoundsFromRoundNumber(round.getChildren());
      round.detach();
    });
  }

  saveStructure() {
    this.processing = true;
    this.setAlert(IAlertType.Info, 'wijzigingen worden opgeslagen');

    // console.log('pre edit-structure has child', this.clonedStructure.getCategory(1).getRootRound().getBorderQualifyGroup(QualifyTarget.Winners) !== undefined);

    this.structureRepository.editObject(this.clonedStructure, this.tournament)
      .subscribe({
        next: (structureRes: Structure) => {
          // console.log('post save-structure has child', this.clonedStructure.getCategory(1).getRootRound().getBorderQualifyGroup(QualifyTarget.Winners) !== undefined);
          this.syncPlanning(structureRes/*this.getLowestLevelAction()*/); // should always be first roundnumber
        },
        error: (e) => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
      });
  }

  protected syncPlanning(structure: Structure) {
    // if (structure.getRoundNumber(1) === undefined) {
    //   return this.resetVariablesAfterSave(structure);
    // }
    this.planningRepository.create(structure, this.tournament)
      .subscribe({
        next: () => {
          this.resetVariablesAfterSave(structure)
        },
        error: e => { this.setAlert(IAlertType.Danger, e); this.processing = false; },
        complete: () => this.processing = false
      });
  }

  protected resetVariablesAfterSave(structureRes: Structure) {
    // const newClonedStructure = this.createClonedStructure(structureRes);
    // console.log((new StructureOutput()).createGrid(structureRes).equalsGrid(
    //   (new StructureOutput()).createGrid(this.clonedStructure)
    // ));
    this.clonedStructure = this.createClonedStructure(structureRes); // updates PlanningInfo
    this.updateFavoriteCategories(this.clonedStructure);
    this.actions = [];
    this.processing = false;
    this.setAlert(IAlertType.Success, 'de wijzigingen zijn opgeslagen');
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
  RemoveQualifier, AddQualifier, UpdateQualifyDistribution,// qualifyActions
  SplitQualifyGroupsFrom, MergeQualifyGroupWithNext // qualifyActions
}

export interface CategoryProperties {
  newName: string;
  newAbbreviation: string | undefined;
}

