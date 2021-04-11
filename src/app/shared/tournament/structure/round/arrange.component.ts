import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Round } from 'ngx-sport';
@Component({
  selector: 'app-tournament-structureround-arrange',
  templateUrl: './arrange.component.html',
  styleUrls: ['./arrange.component.css']
})
export class StructureRoundArrangeComponent {

  @Input() round: Round | undefined;
  @Output() arrangeAction = new EventEmitter<string>();

  constructor() {
  }

  addPouleToRootRound() {
    this.arrangeAction.emit('addPouleToRootRound');
  }

  removePouleFromRootRound() {
    this.arrangeAction.emit('removePouleFromRootRound');
  }

  addPlaceToRootRound() {
    this.arrangeAction.emit('addPlaceToRootRound');
  }

  removePlaceFromRootRound() {
    this.arrangeAction.emit('removePlaceFromRootRound');
  }

  incrementNrOfPoules() {
    this.arrangeAction.emit('incrementNrOfPoules');
  }

  decrementNrOfPoules() {
    this.arrangeAction.emit('decrementNrOfPoules');
  }



  canRemovePlace() {
    return !this.hasMinimumNrOfPlacesPerPoule();
  }

  hasMinimumNrOfPlacesPerPoule() {
    return this.round && (this.round.getPoules().length * 2) === this.round.getNrOfPlaces();
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
