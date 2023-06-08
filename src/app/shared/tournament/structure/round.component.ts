import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Round, Competitor, StructureEditor, QualifyTarget, PlaceRanges, Place, StructureNameService, StartLocation } from 'ngx-sport';
import { StructureAction, StructureActionName } from '../../../admin/structure/edit.component';
import { IAlert, IAlertType } from '../../common/alert';
import { CSSService } from '../../common/cssservice';

@Component({
  selector: 'app-tournament-structureround',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class StructureRoundComponent {
  @Input() structureEditor!: StructureEditor;
  @Input() round!: Round;
  @Input() editable: boolean = false;
  @Input() showCompetitors: boolean = false;
  @Input() favorites: Competitor[] = [];
  @Input() structureNameService!: StructureNameService;
  @Input() lastAction: StructureAction | undefined;
  @Output() addAction = new EventEmitter<StructureAction>();
  alert: IAlert | undefined;
  popoverPlace: Place | undefined;

  constructor(public cssService: CSSService) {
    this.resetAlert();
  }

  arrangeAction(actionName: StructureActionName) {
    this.resetAlert();
    try {
      if (actionName === StructureActionName.AddPouleToRootRound) {
        this.structureEditor.addPouleToRootRound(this.round);
      } else if (actionName === StructureActionName.RemovePouleFromRootRound) {
        try {
          this.structureEditor.removePouleFromRootRound(this.round);
        } catch (e: any) {
          console.log(e);
          throw new Error('de poule kan niet verwijderd worden, pas de poules in de eerst volgende ronde aan');
        }
      } else if (actionName === StructureActionName.AddPlaceToRootRound) {
        this.structureEditor.addPlaceToRootRound(this.round);
      } else if (actionName === StructureActionName.RemovePlaceFromRootRound) {
        this.structureEditor.removePlaceFromRootRound(this.round);
      } else if (actionName === StructureActionName.IncrementNrOfPoules) {
        this.structureEditor.incrementNrOfPoules(this.round);
      } else if (actionName === StructureActionName.DecrementNrOfPoules) {
        this.structureEditor.decrementNrOfPoules(this.round);
      }
      this.addAction.emit({
        pathNode: this.round.getPathNode(),
        name: actionName,
        recreateStructureNameService: true
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

  isFavorite(place: Place): boolean {
    if (this.favorites.length === 0) {
      return false;
    }
    const startLocation = place.getStartLocation();
    if (startLocation === undefined) {
      return false;
    }
    const competitor = this.getCompetitor(startLocation);
    if (competitor === undefined) {
      return false;
    }
    return this.favorites.indexOf(competitor) >= 0;
  }

  getCompetitorName(place: Place): string {
    const startLocation = place.getStartLocation();
    if (startLocation === undefined) {
      return '';
    }
    const competitor = this.getCompetitor(startLocation);
    if (competitor === undefined) {
      return '';
    }
    return competitor.getName();
  }

  getCompetitor(startLocation: StartLocation): Competitor | undefined {
    return this.structureNameService.getStartLocationMap()?.getCompetitor(startLocation);
  }

  getPlaceAlignClass(): string {
    return this.editable || !this.showCompetitors ? 'text-center' : 'text-start';
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
