import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NameService, Round, Competitor, StructureEditor, QualifyTarget, PlaceRanges, Place, Category, StructureNameService } from 'ngx-sport';
import { StructureAction, StructureActionName } from '../../../admin/structure/edit.component';
import { IAlert, IAlertType } from '../../common/alert';
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
  // @Input() first!: boolean;
  @Input() favorites: Competitor[] = [];
  @Input() structureNameService!: StructureNameService;
  @Input() lastAction: StructureAction | undefined;
  @Output() addAction = new EventEmitter<StructureAction>();
  @Output() remove = new EventEmitter<Category>();

  constructor(public cssService: CSSService, private modalService: NgbModal) {

  }

  ngOnInit() {
  }

  changeName(category: Category) {
    const modal = this.getChangeNameModel('wijzigen');
    modal.componentInstance.initialName = category.getName();
    modal.result.then((newName: string) => {
      category.setName(newName);
      this.addAction.emit({ name: StructureActionName.UpdateCategory, recreateStructureNameService: false });
    });
  }

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
