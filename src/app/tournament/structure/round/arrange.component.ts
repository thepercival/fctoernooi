import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Round, StructureService } from 'ngx-sport';

import { Tournament } from '../../../lib/tournament';

@Component({
  selector: 'app-tournament-structureround-arrange',
  templateUrl: './arrange.component.html',
  styleUrls: ['./arrange.component.css']
})
export class TournamentStructureRoundArrangeComponent {

  @Input() round: Round;
  private structureService: StructureService;
  @Output() arrangeAction = new EventEmitter<string>();

  constructor() {
    this.structureService = new StructureService({ min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS });
  }

  addPoule() {
    if (this.round.isRoot()) {
      // poule toevoegen met zelfde aantal deelnemers als laatste poule
      this.arrangeAction.emit('addPoule');
    } else {
      // poule toevoegen, maar zelfde aantal deelnemers behouden
    }
  }

  removePoule() {
    if (this.round.isRoot()) {
      // poule toevoegen met zelfde aantal deelnemers als laatste poule
      this.arrangeAction.emit('removePoule');
    } else {
      // poule toevoegen, maar zelfde aantal deelnemers behouden
    }
  }

  addPlace() {
    if (this.round.isRoot()) {
      this.arrangeAction.emit('addPlace');
    }
  }

  removePlace() {
    this.arrangeAction.emit('removePlace');
  }

  canRemovePlace() {
    return !this.hasMinimumNrOfPlacesPerPoule();
  }

  hasMinimumNrOfPlacesPerPoule() {
    return (this.round.getPoules().length * 2) === this.round.getNrOfPlaces();
  }
}
