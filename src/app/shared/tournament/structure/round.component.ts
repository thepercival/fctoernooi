import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NameService, Round, RoundNumber, Competitor, CompetitorMap, StructureEditor, QualifyTarget, PlaceRanges } from 'ngx-sport';
import { IAlert } from '../../common/alert';
import { CSSService } from '../../common/cssservice';

@Component({
  selector: 'app-tournament-structureround',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class StructureRoundComponent implements OnInit {
  @Input() structureEditor!: StructureEditor;
  @Input() round!: Round;
  @Input() editable: boolean = false;
  @Input() first!: boolean;
  @Input() favorites: Competitor[] = [];
  @Input() nameService!: NameService;
  @Output() roundNumberChanged = new EventEmitter<RoundNumber>();
  alert: IAlert | undefined;

  constructor(public cssService: CSSService) {
    this.resetAlert();
  }

  ngOnInit() {
  }

  arrangeAction(action: string) {
    this.resetAlert();
    try {
      if (action === 'addPouleToRootRound') {
        this.structureEditor.addPouleToRootRound(this.round);
      } else if (action === 'removePouleFromRootRound') {
        this.structureEditor.removePouleFromRootRound(this.round);
      } else if (action === 'addPlaceToRootRound') {
        this.structureEditor.addPlaceToRootRound(this.round);
      } else if (action === 'removePlaceFromRootRound') {
        this.structureEditor.removePlaceFromRootRound(this.round);
      } else if (action === 'incrementNrOfPoules') {
        this.structureEditor.incrementNrOfPoules(this.round);
      } else if (action === 'decrementNrOfPoules') {
        this.structureEditor.decrementNrOfPoules(this.round);
      }
      this.nameService.resetStructure();
      this.roundNumberChanged.emit(this.round.getNumber());
    } catch (e: any) {
      this.setAlert('danger', e.message);
    }
  }

  get TargetWINNERS(): QualifyTarget {
    return QualifyTarget.Winners;
  }

  get TargetLOSERS(): QualifyTarget {
    return QualifyTarget.Losers;
  }

  getNrOfPoulesChildren(round: Round): number {
    let nrOfChildPoules = 0;
    round.getQualifyGroups().forEach(qualifyGroup => {
      nrOfChildPoules += qualifyGroup.getChildRound().getPoules().length;
    });
    return nrOfChildPoules;
  }

  isFavorite(competitor: Competitor | undefined) {
    if (competitor === undefined) {
      return false;
    }
    return this.favorites && this.favorites.indexOf(competitor) >= 0;
  }

  get AbsoluteMinPlacesPerPoule(): number {
    return PlaceRanges.MinNrOfPlacesPerPoule;
  }

  get MinPlacesPerPoule(): number {
    return this.structureEditor.getMinPlacesPerPouleSmall();
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  protected setAlert(type: string, message: string) {
    this.alert = { type: type, message: message };
  }
}
