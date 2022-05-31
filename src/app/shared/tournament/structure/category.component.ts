import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Competitor, StructureEditor, Category, StructureNameService } from 'ngx-sport';
import { StructureAction, UpdateCategoryNameAction } from '../../../admin/structure/edit.component';
import { CSSService } from '../../common/cssservice';
import { NameModalComponent } from '../namemodal/namemodal.component';

@Component({
  selector: 'app-tournament-structurecategory',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class StructureCategoryComponent implements OnInit {
  @Input() structureEditor!: StructureEditor;
  @Input() category!: Category;
  @Input() editable: boolean = false;
  @Input() filterActive: boolean = false;
  @Input() showCompetitors!: boolean;
  @Input() favoriteCompetitors: Competitor[] = [];
  @Input() structureNameService!: StructureNameService;
  @Input() lastAction: StructureAction | undefined;
  @Output() addAction = new EventEmitter<StructureAction>();
  @Output() remove = new EventEmitter<Category>();
  @Output() updateName = new EventEmitter<UpdateCategoryNameAction>();
  @Output() moveCategoryUp = new EventEmitter<Category>();

  constructor(public cssService: CSSService, private modalService: NgbModal) {

  }

  ngOnInit() {
  }

  changeName(category: Category) {
    const modal = this.getChangeNameModel('wijzigen');
    modal.componentInstance.initialName = category.getName();
    modal.result.then((newName: string) => {
      this.updateName.emit({ category, newName });
    }, (reason) => {
    });
  }

  get movable(): boolean { return this.editable && !this.filterActive && this.category.getNumber() > 1 };

  getChangeNameModel(buttonLabel: string): NgbModalRef {
    const activeModal = this.modalService.open(NameModalComponent);
    activeModal.componentInstance.header = 'categorienaam';
    activeModal.componentInstance.range = { min: 3, max: 15 };
    activeModal.componentInstance.buttonName = buttonLabel;
    activeModal.componentInstance.labelName = 'naam';
    activeModal.componentInstance.buttonOutline = true;
    return activeModal;
  }
}
