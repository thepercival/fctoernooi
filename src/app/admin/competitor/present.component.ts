import { Component, Input, OnChanges, output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Category, Place, StartLocationMap, StructureNameService } from 'ngx-sport';
import { forkJoin, Observable } from 'rxjs';
import { TournamentCompetitor } from '../../lib/competitor';
import { LockerRoomValidator } from '../../lib/lockerroom/validator';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { Tournament } from '../../lib/tournament';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { TournamentCompetitorMapper } from '../../lib/competitor/mapper';

@Component({
  selector: 'app-tournament-competitors-present',
  templateUrl: './present.component.html',
  styleUrls: ['./present.component.scss']
})
export class CompetitorPresentListComponent implements OnChanges {
  @Input() tournament!: Tournament;
  @Input() category!: Category;
  @Input() showHeader!: boolean;
  @Input() structureNameService!: StructureNameService;
  @Input() activeTab!: number;

  onAlertChange = output<IAlert>();
  onCompetitorsUpdate = output();

  public placeCompetitorItems: PlaceCompetitorItem[] = [];
  public orderMode = false;
  public swapItem: PlaceCompetitorItem | undefined;
  private startLocationMap!: StartLocationMap;
  // public alert: IAlert | undefined;
  public processing = false;

  constructor(
    private router: Router,
    private competitorRepository: CompetitorRepository,
    private competitorMapper: TournamentCompetitorMapper) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.structureNameService !== undefined
      && changes.structureNameService.currentValue !== changes.structureNameService.previousValue
      /*&& changes.structureNameService.firstChange === false*/) {
      // this.updateItems();
      const startLocationMap = this.structureNameService.getStartLocationMap();
      if (startLocationMap) {
        this.startLocationMap = startLocationMap;
        this.updatePlaceCompetitorItems();
      }
    }
  }

  updatePlaceCompetitorItems(): void {
    this.placeCompetitorItems = this.category.getRootRound().getPlaces().map((place: Place): PlaceCompetitorItem => {
      const startLocation = place.getStartLocation();
      if (startLocation === undefined) {
        throw Error('rootroundplace should always have startLocation');
      }
      return { place, competitor: <TournamentCompetitor | undefined>this.startLocationMap.getCompetitor(startLocation) };
    });
  }

  somePlaceHasACompetitor(): boolean {
    return this.placeCompetitorItems.some((item: PlaceCompetitorItem) => {
      return item.competitor !== undefined;
    });
  }

  setPresency(competitor: TournamentCompetitor): void {
    this.processing = true;
    const jsonCompetitor = this.competitorMapper.toJson(competitor);
    jsonCompetitor.present = competitor.getPresent() === true ? false : true;

    // const prefix = jsonCompetitor.present ? 'aan' : 'af';
    // const message = 'deelnemer ' + competitor.getName() + ' wordt ' + prefix + 'gemeld';

    // this.processing.emit(message);

    this.competitorRepository.editObject(jsonCompetitor, competitor, this.tournament.getId())
      .subscribe({
        complete: () => this.processing = false
      });
  }

  getPresentId(place: Place): string {
    return 'present-' + place.getId();
  }
  

  // protected setAlert(type: IAlertType, message: string) {
  //   this.alert = { 'type': type, 'message': message };
  // }

  // protected resetAlert(): void {
  //   this.alert = undefined;
  // }
}

