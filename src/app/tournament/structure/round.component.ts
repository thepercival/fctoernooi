import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NameService, Round, RoundNumber, StructureService } from 'ngx-sport';
import { max } from 'rxjs/operators';

import { CSSService } from '../../common/cssservice';
import { Tournament } from '../../lib/tournament';

@Component({
  selector: 'app-tournament-structureround',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class TournamentStructureRoundComponent {

  @Input() round: Round;
  @Output() roundNumberChanged = new EventEmitter<RoundNumber>();
  @Input() editable: boolean;
  public alert: any;
  private structureService: StructureService;

  constructor(public nameService: NameService, public cssService: CSSService) {
    this.resetAlert();
    this.structureService = new StructureService({ min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS });
  }

  arrangeAction(action: string) {
    this.resetAlert();
    try {
      if (action === 'removePoule') {
        this.removePoule();
      } else if (action === 'addPoule') {
        this.addPoule();
      } else if (action === 'removePlace') {
        this.removePlace();
      } else if (action === 'addPlace') {
        this.addPlace();
      }
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  protected removePoule() {
    if (this.round.isRoot()) {
      // poule verwijderen maar wel hetzelfde aantal deelnemers behouden
      this.structureService.removePoule(this.round);
    } else {
      // poule verwijderen, ??
    }
  }

  protected addPoule() {
    if (this.round.isRoot()) {
      // poule toevoegen met zelfde aantal deelnemers als laatste poule
      this.structureService.addPoule(this.round);
    } else {
      // poule toevoegen, maar zelfde aantal deelnemers behouden
    }
  }

  protected removePlace() {
    if (this.round.isRoot()) {
      this.structureService.removePlaceFromRootRound(this.round);
    }
  }

  protected addPlace() {
    if (this.round.isRoot()) {
      this.structureService.addPlaceToRootRound(this.round);
    }
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  protected setAlert(type: string, message: string) {
    this.alert = { type: type, message: message };
  }
}
