import { Component, Input, output } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Competitor, StructureEditor, Category, StructureNameService } from 'ngx-sport';
import { CategoryProperties, StructureAction } from '../../../admin/structure/edit.component';
import { CSSService } from '../../common/cssservice';
import { CategoryModalComponent } from './categorymodal/categorymodal.component';

@Component({
  selector: 'app-tournament-structurecategory',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class StructureCategoryComponent  {
  @Input() structureEditor!: StructureEditor;
  @Input() categories!: Category[];
  @Input() category!: Category;
  @Input() showHeader!: boolean;
  @Input() editable: boolean = false;
  @Input() filterActive: boolean = false;
  @Input() showCompetitors!: boolean;
  @Input() favoriteCompetitors: Competitor[] = [];
  @Input() structureNameService!: StructureNameService;
  @Input() lastAction: StructureAction | undefined;
  
  onActionAdd = output<StructureAction>();
  onCategoryRemove = output<Category>();
  onCategoryUpdate = output<CategoryProperties>();
  onCategoryMoveUp = output<Category>();

  public canEdit: boolean = false;

  constructor(public cssService: CSSService, private modalService: NgbModal) {

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
}
