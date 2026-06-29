import { Component, Input, OnChanges, output, signal, SimpleChanges, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Category, Place, StartLocationMap, StructureNameService } from 'ngx-sport';
import { TournamentCompetitor } from '../../lib/competitor';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { Tournament } from '../../lib/tournament';
import { IAlert } from '../../shared/common/alert';
import { TournamentCompetitorMapper } from '../../lib/competitor/mapper';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EscapeHtmlPipe } from '../../shared/common/escapehtmlpipe';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-competitors-present',
    templateUrl: './present.component.html',
    styleUrls: ['./present.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgbAlert,FontAwesomeModule,EscapeHtmlPipe]
})
export class CompetitorPresentListComponent implements OnChanges {
  faSpinner = faSpinner;
  @Input() tournament!: Tournament;
  @Input() category!: Category;
  @Input() showHeader!: boolean;
  @Input() structureNameService!: StructureNameService;
  @Input() activeTab!: number;

  onAlertChange = output<IAlert>();
  onCompetitorsUpdate = output();

  public placeCompetitorItems: PlaceCompetitorItem[] = [];
  public poulePlaceCompetitorItems: { pouleNr: number, items: PlaceCompetitorItem[] }[] = [];
  public orderMode = false;
  public swapItem: PlaceCompetitorItem | undefined;
  private startLocationMap!: StartLocationMap;
  // public alert: IAlert | undefined;
  public readonly processingCompetitorIds: WritableSignal<(string | number)[]> = signal([]);
  
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

    const pouleMap = new Map<number, PlaceCompetitorItem[]>();
    this.placeCompetitorItems.forEach((item: PlaceCompetitorItem) => {
      const startLocation = item.place.getStartLocation();
      if (startLocation === undefined) {
        return;
      }
      const pouleNr = startLocation.getPouleNr();
      const existing = pouleMap.get(pouleNr);
      if (existing === undefined) {
        pouleMap.set(pouleNr, [item]);
        return;
      }
      existing.push(item);
    });

    this.poulePlaceCompetitorItems = Array.from(pouleMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([pouleNr, items]) => ({ pouleNr, items }));
  }

  somePlaceHasACompetitor(): boolean {
    return this.placeCompetitorItems.some((item: PlaceCompetitorItem) => {
      return item.competitor !== undefined;
    });
  }

  setPresency(competitor: TournamentCompetitor): void {
    const competitorId = competitor.getId();
    this.processingCompetitorIds.update((ids: (string | number)[]) => {
      return ids.includes(competitorId) ? ids : [...ids, competitorId];
    });
    const previousPresent = competitor.getPresent();
    const jsonCompetitor = this.competitorMapper.toJson(competitor);
    jsonCompetitor.present = previousPresent === true ? false : true;
    competitor.setPresent(jsonCompetitor.present);

    // const prefix = jsonCompetitor.present ? 'aan' : 'af';
    // const message = 'deelnemer ' + competitor.getName() + ' wordt ' + prefix + 'gemeld';

    // this.processing.emit(message);

    this.competitorRepository.editObject(jsonCompetitor, competitor, this.tournament.getId())
      .subscribe({
        next: () => this.onCompetitorsUpdate.emit(),
        error: () => {
          competitor.setPresent(previousPresent);
          this.processingCompetitorIds.update((ids: (string | number)[]) => ids.filter((id) => id !== competitorId));
        },
        complete: () => this.processingCompetitorIds.update((ids: (string | number)[]) => ids.filter((id) => id !== competitorId))
      });
  }

  isProcessing(competitor: TournamentCompetitor): boolean {
    return this.processingCompetitorIds().includes(competitor.getId());
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

