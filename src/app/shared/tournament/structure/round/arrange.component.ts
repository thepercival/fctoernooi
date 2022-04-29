import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Round, StructureEditor } from 'ngx-sport';
import { StructureActionName } from '../../../../admin/structure/edit.component';
@Component({
  selector: 'app-tournament-structureround-arrange',
  templateUrl: './arrange.component.html',
  styleUrls: ['./arrange.component.scss']
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

  showHorizontal(): boolean {
    const nrOfRounds = this.round.getNumber().getRounds().length;
    return nrOfRounds <= 8;
  }

  showVertical(): boolean {
    const nrOfRounds = this.round.getNumber().getRounds().length;
    return nrOfRounds > 2;
  }

  horViewPortClass(): string {
    const nrOfRounds = this.round.getNumber().getRounds().length;
    if (nrOfRounds <= 2) {
      return ''
    } else if (nrOfRounds <= 4) {
      return 'd-none d-md-inline'
    } else if (nrOfRounds <= 6) {
      return 'd-none d-lg-inline'
    } else if (nrOfRounds <= 8) {
      return 'd-none d-xl-inline'
    }
    return 'd-none';
  }

  vertViewPortClass(): string {
    const nrOfRounds = this.round.getNumber().getRounds().length;
    if (nrOfRounds <= 2) {
      return 'd-none';
    } else if (nrOfRounds <= 4) {
      return 'd-md-none'
    } else if (nrOfRounds <= 6) {
      return 'd-lg-none'
    } else if (nrOfRounds <= 8) {
      return 'd-xl-none'
    }
    return '';
  }

  /* chilround(arrange)
            vert  hor
xs > 1  show  hide
sm > 1  show  hide
md > 4
lg > 6
xl > 8
*/

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
