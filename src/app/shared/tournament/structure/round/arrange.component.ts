import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Round, StructureEditor } from 'ngx-sport';
import { StructureActionName } from '../../../../admin/structure/edit.component';
@Component({
  selector: 'app-tournament-structureround-arrange',
  templateUrl: './arrange.component.html',
  styleUrls: ['./arrange.component.css']
})
export class StructureRoundArrangeComponent {
  @Input() structureEditor!: StructureEditor;
  @Input() round!: Round;
  @Output() arrangeAction = new EventEmitter<StructureActionName>();

  constructor() {
  }

  addPouleToRootRound() {
    this.arrangeAction.emit(StructureActionName.AddPouleToRootRound);
  }

  removePouleFromRootRound() {
    this.arrangeAction.emit(StructureActionName.RemovePouleFromRootRound);
  }

  addPlaceToRootRound() {
    this.arrangeAction.emit(StructureActionName.AddPlaceToRootRound);
  }

  removePlaceFromRootRound() {
    this.arrangeAction.emit(StructureActionName.RemovePlaceFromRootRound);
  }

  incrementNrOfPoules() {
    this.arrangeAction.emit(StructureActionName.IncrementNrOfPoules);
  }

  decrementNrOfPoules() {
    this.arrangeAction.emit(StructureActionName.DecrementNrOfPoules);
  }

  canChange(delta: number): boolean {
    try {
      this.structureEditor.validate(this.round.getNrOfPlaces(), this.round.getPoules().length + delta);
      return true;
    } catch (e) {
      return false;
    }
  }

  canRemovePouleFromRoot(): boolean {
    return this.round.getPoules().length > 1;
  }

  canRemovePlaceFromRoot(): boolean {
    return this.round.getPlaces().length > this.structureEditor.getMinPlacesPerPouleSmall();
  }

  canDecrementNrOfPoules(): boolean {
    return this.canChange(-1);
  }

  canIncrementNrOfPoules(): boolean {
    return this.canChange(1);
  }

  getRemovePouleFromRootRoundBtnClass(): string {
    return this.canRemovePouleFromRoot() ? 'primary' : 'secondary';
  }

  getRemovePlaceFromRootRoundBtnClass(): string {
    return this.canRemovePlaceFromRoot() ? 'primary' : 'secondary';
  }

  getDecrementBtnClass(): string {
    return this.canDecrementNrOfPoules() ? 'primary' : 'secondary';
  }

  getIncrementBtnClass(): string {
    return this.canIncrementNrOfPoules() ? 'primary' : 'secondary';
  }




  // getDivisionClasses(round: Round): string {
  //   const nrOfRounds = round.getNumber().getRounds().length;
  //   let classes = '';
  //   if (nrOfRounds > 2) {
  //     classes += 'more-than-two-rounds';
  //   }
  //   if (nrOfRounds > 4) {
  //     classes += ' more-than-four-rounds';
  //   }
  //   if (nrOfRounds > 8) {
  //     classes += ' more-than-eight-rounds';
  //   }
  //   return classes;
  // }
}
