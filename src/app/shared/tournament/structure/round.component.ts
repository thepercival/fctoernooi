import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NameService, Round, Competitor, StructureEditor, QualifyTarget, PlaceRanges, Place } from 'ngx-sport';
import { StructureAction, StructureActionName } from '../../../admin/structure/edit.component';
import { IAlert, IAlertType } from '../../common/alert';
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
  @Input() lastAction: StructureAction | undefined;
  @Output() addAction = new EventEmitter<StructureAction>();
  alert: IAlert | undefined;
  popoverPlace: Place | undefined;

  constructor(public cssService: CSSService) {
    this.resetAlert();
  }

  ngOnInit() {
  }

  arrangeAction(actionName: StructureActionName) {
    this.resetAlert();
    try {
      if (actionName === StructureActionName.AddPouleToRootRound) {
        this.structureEditor.addPouleToRootRound(this.round);
      } else if (actionName === StructureActionName.RemovePouleFromRootRound) {
        this.structureEditor.removePouleFromRootRound(this.round);
      } else if (actionName === StructureActionName.AddPlaceToRootRound) {
        this.structureEditor.addPlaceToRootRound(this.round);
      } else if (actionName === StructureActionName.RemovePlaceFromRootRound) {
        this.structureEditor.removePlaceFromRootRound(this.round);
      } else if (actionName === StructureActionName.IncrementNrOfPoules) {
        this.structureEditor.incrementNrOfPoules(this.round);
      } else if (actionName === StructureActionName.DecrementNrOfPoules) {
        this.structureEditor.decrementNrOfPoules(this.round);
      }
      this.nameService.resetStructure();
      this.addAction.emit({
        path: this.round.getStructurePathNode(),
        name: actionName,
      });
    } catch (e: any) {
      this.setAlert(IAlertType.Danger, e.message);
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

  protected setAlert(type: IAlertType, message: string) {
    this.alert = { type: type, message: message };
  }

  setPopoverPlace(place: Place) {
    this.popoverPlace = place;
  }
}
