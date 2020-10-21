import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { HorizontalPoule, NameService, QualifyGroup, Round, RoundNumber, StructureService, Competitor, PlaceLocationMap } from 'ngx-sport';

import { IAlert } from '../../common/alert';
import { CSSService } from '../../common/cssservice';
import { Tournament } from '../../../lib/tournament';
import { StructureViewType } from './qualify.component';

@Component({
  selector: 'app-tournament-structureround',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class StructureRoundComponent implements OnInit {

  @Input() round: Round;
  @Output() roundNumberChanged = new EventEmitter<RoundNumber>();
  @Input() editable: boolean;
  @Input() first: boolean;
  @Input() favorites: Competitor[];
  @Input() placeLocationMap: PlaceLocationMap;
  viewType: number = StructureViewType.ROUNDSTRUCTURE;
  alert: IAlert;
  public nameService: NameService;
  private structureService: StructureService;

  constructor(public cssService: CSSService) {
    this.resetAlert();
    this.structureService = new StructureService(Tournament.PlaceRanges);
  }

  ngOnInit() {
    this.nameService = new NameService(this.placeLocationMap);
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
      this.roundNumberChanged.emit(this.round.getNumber());
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  get QualifyGroupWINNERS(): number {
    return QualifyGroup.WINNERS;
  }

  get QualifyGroupLOSERS(): number {
    return QualifyGroup.LOSERS;
  }

  get ViewTypeQualifyGroups(): number {
    return StructureViewType.QUALIFYGROUPS;
  }

  protected removePoule() {
    this.structureService.removePoule(this.round, this.round.isRoot());
  }

  protected addPoule() {
    this.structureService.addPoule(this.round, this.round.isRoot());
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

  getEditHorizontalPoules(): EditHorPoule[] {
    const horizontalPoulesWinners: HorizontalPoule[] = [];
    // QualifyGroup.WINNERS
    this.round.getQualifyGroups(QualifyGroup.WINNERS).forEach(qualifyGroup => {
      qualifyGroup.getHorizontalPoules().forEach(horizontalPoule => {
        if (horizontalPoule.getNrOfQualifiers() > 1) {
          horizontalPoulesWinners.push(horizontalPoule);
        }
      });
    });

    // QualifyGroup.LOSERS
    const horizontalPoulesLosers: HorizontalPoule[] = [];
    this.round.getQualifyGroups(QualifyGroup.LOSERS).forEach(qualifyGroup => {
      qualifyGroup.getHorizontalPoules().forEach(horizontalPoule => {
        if (horizontalPoule.getNrOfQualifiers() > 1) {
          horizontalPoulesLosers.unshift(horizontalPoule);
        }
      });
    });

    // QualifyGroup.DROPOUTS
    const lastWinnersHorPoule = horizontalPoulesWinners[horizontalPoulesWinners.length - 1];
    const lastLosersHorPoule = horizontalPoulesLosers[0]; // because losers are unshifted instead of pushed
    const horizontalPoulesDropouts: HorizontalPoule[] = this.round.getHorizontalPoules(QualifyGroup.WINNERS).filter(horizontalPoule => {
      return ((!lastWinnersHorPoule || horizontalPoule.getPlaceNumber() > lastWinnersHorPoule.getPlaceNumber())
        && (!lastLosersHorPoule || horizontalPoule.getPlaceNumber() < lastLosersHorPoule.getPlaceNumber())
      );
    });

    let horizontalPoules: HorizontalPoule[] = horizontalPoulesWinners.concat(horizontalPoulesDropouts);
    horizontalPoules = horizontalPoules.concat(horizontalPoulesLosers);

    const editHorPoules: EditHorPoule[] = [];
    let previous;
    horizontalPoules.forEach(horizontalPoule => {
      const editHorPoule = { current: horizontalPoule, previous: previous };
      editHorPoules.push(editHorPoule);
      previous = horizontalPoule;
    });
    return editHorPoules;
  }

  isQualifyGroupSplittable(editHorPoule: EditHorPoule): boolean {
    return this.structureService.isQualifyGroupSplittable(editHorPoule.previous, editHorPoule.current);
  }

  areQualifyGroupsMergable(editHorPoule: EditHorPoule): boolean {
    return (editHorPoule.previous
      && this.structureService.areQualifyGroupsMergable(
        editHorPoule.previous.getQualifyGroup(),
        editHorPoule.current.getQualifyGroup()));
  }

  splitQualifyGroup(editHorPoule: EditHorPoule) {
    this.structureService.splitQualifyGroup(editHorPoule.previous.getQualifyGroup(), editHorPoule.previous, editHorPoule.current);
    this.roundNumberChanged.emit(this.round.getNumber());
  }

  mergeQualifyGroups(editHorPoule: EditHorPoule) {
    this.structureService.mergeQualifyGroups(editHorPoule.previous.getQualifyGroup(), editHorPoule.current.getQualifyGroup());
    this.roundNumberChanged.emit(this.round.getNumber());
  }

  getQualifyGroupWidthPercentage(qualifyGroup: QualifyGroup): number {
    const nrOfPoules = qualifyGroup.getChildRound().getPoules().length;
    return Math.floor((nrOfPoules / this.getNrOfPoulesChildren(qualifyGroup.getRound())) * 100);
  }

  getNrOfPoulesChildren(round: Round): number {
    let nrOfChildPoules = 0;
    round.getQualifyGroups().forEach(qualifyGroup => {
      nrOfChildPoules += qualifyGroup.getChildRound().getPoules().length;
    });
    return nrOfChildPoules;
  }

  isFavorite(competitor: Competitor) {
    if (competitor === undefined) {
      return false;
    }
    return this.favorites && this.favorites.indexOf(competitor) >= 0;
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  protected setAlert(type: string, message: string) {
    this.alert = { type: type, message: message };
  }
}

interface EditHorPoule {
  current: HorizontalPoule;
  previous: HorizontalPoule;
}

