import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Competitor, StructureEditor, Category, StructureNameService } from 'ngx-sport';
import { CategoryProperties, StructureAction } from '../../../admin/structure/edit.component';
import { CSSService } from '../../common/cssservice';
import { CategoryModalComponent } from './categorymodal/categorymodal.component';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';
import { StructureRoundComponent } from './round.component';
import { faLevelUpAlt, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-structurecategory',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS, StructureRoundComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StructureCategoryComponent  {
  public structureEditor = input.required<StructureEditor>();
  public categories = input.required<Category[]>();
  public category = input.required<Category>();
  public showHeader = input.required<boolean>();
  public editable = input(false);
  public filterActive = input(false);
  public showCompetitors = input.required<boolean>();
  public favoriteCompetitors = input<Competitor[]>([]);
  public structureNameService = input.required<StructureNameService>();
  public lastAction = input<StructureAction | undefined>(undefined);
  public faPencilAlt = faPencilAlt;
  public faLevelUpAlt = faLevelUpAlt;
  public faTrashAlt = faTrashAlt;
  
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

  get movable(): boolean { return this.editable() && !this.filterActive && this.category().getNumber() > 1 };

  getCategoryModel(category: Category): NgbModalRef {
    const activeModal = this.modalService.open(CategoryModalComponent);
    
    activeModal.componentInstance.categories = this.categories;
    activeModal.componentInstance.category = category;
    activeModal.componentInstance.buttonLabel = 'wijzigen';    
    return activeModal;
  }
}
