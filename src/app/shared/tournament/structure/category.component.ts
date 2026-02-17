import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Competitor, StructureEditor, Category, StructureNameService } from 'ngx-sport';
import { CategoryProperties, StructureAction } from '../../../admin/structure/edit.component';
import { CSSService } from '../../common/cssservice';
import { CategoryModalComponent } from './categorymodal/categorymodal.component';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';
import { StructureRoundComponent } from './round.component';

@Component({
    selector: 'app-tournament-structurecategory',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS, StructureRoundComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StructureCategoryComponent  {
  readonly _structureEditor = input.required<StructureEditor>();
  readonly _categories = input.required<Category[]>();
  readonly _category = input.required<Category>();
  readonly _showHeader = input.required<boolean>();
  readonly _editable = input(false);
  readonly _filterActive = input(false);
  readonly _showCompetitors = input.required<boolean>();
  readonly _favoriteCompetitors = input<Competitor[]>([]);
  readonly _structureNameService = input.required<StructureNameService>();
  readonly _lastAction = input<StructureAction | undefined>(undefined);
  
  readonly onActionAdd = output<StructureAction>();
  readonly onCategoryRemove = output<Category>();
  readonly onCategoryUpdate = output<CategoryProperties>();
  readonly onCategoryMoveUp = output<Category>();

  public canEdit: boolean = false;

  private modalService = inject(NgbModal);

  constructor(public cssService: CSSService) {

  }

  updateCategoryAction(category: Category) {
    const modal = this.getCategoryModel(category);
    modal.componentInstance.initialName = category.getName();
    modal.result.then((categoryProperties: CategoryProperties) => {
      this.onCategoryUpdate.emit(categoryProperties);
    }, (reason) => {
    });
  }

  get movable(): boolean { return this.editable && !this.filterActive && this.category.getNumber() > 1 };

  getCategoryModel(category: Category): NgbModalRef {
    const activeModal = this.modalService.open(CategoryModalComponent);
    
    activeModal.componentInstance.categories = this.categories;
    activeModal.componentInstance.category = category;
    activeModal.componentInstance.buttonLabel = 'wijzigen';    
    return activeModal;
  }

  get structureEditor(): StructureEditor {
    return this._structureEditor();
  }

  get categories(): Category[] {
    return this._categories();
  }

  get category(): Category {
    return this._category();
  }

  get showHeader(): boolean {
    return this._showHeader();
  }

  get editable(): boolean {
    return this._editable();
  }

  get filterActive(): boolean {
    return this._filterActive();
  }

  get showCompetitors(): boolean {
    return this._showCompetitors();
  }

  get favoriteCompetitors(): Competitor[] {
    return this._favoriteCompetitors();
  }

  get structureNameService(): StructureNameService {
    return this._structureNameService();
  }

  get lastAction(): StructureAction | undefined {
    return this._lastAction();
  }
}
