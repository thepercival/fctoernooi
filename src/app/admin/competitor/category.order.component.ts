import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Category, Competitor, Place, StartLocationMap, StructureEditor, StructureNameService } from 'ngx-sport';
import { forkJoin, Observable } from 'rxjs';
import { TournamentCompetitor } from '../../lib/competitor';
import { LockerRoomValidator } from '../../lib/lockerroom/validator';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { Tournament } from '../../lib/tournament';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { CompetitorListRemoveModalComponent } from './listremovemodal.component';

@Component({
  selector: 'app-tournament-category-competitors-order',
  templateUrl: './category.order.component.html',
  styleUrls: ['./category.order.component.scss']
})
export class CategoryOrderCompetitorListComponent implements OnChanges {
  @Input() tournament!: Tournament;
  @Input() category!: Category;
  @Input() showHeader!: boolean;
  @Input() structureNameService!: StructureNameService;
  @Input() activeTab!: number;

  @Output() alert = new EventEmitter<IAlert>();  
  @Output() competitorsUpdate = new EventEmitter();

  public placeCompetitorItems: PlaceCompetitorItem[] = [];
  public orderMode = false;
  public swapItem: PlaceCompetitorItem | undefined;
  private startLocationMap!: StartLocationMap;
  public hasSomeCompetitorAnImage: boolean = false;
  // public alert: IAlert | undefined;
  public processing = false;

  constructor(
    private router: Router,
    private competitorRepository: CompetitorRepository,
    private modalService: NgbModal) {
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
    this.hasSomeCompetitorAnImage = this.tournament.getCompetitors().some((competitor: TournamentCompetitor): boolean => {
      return (competitor.getLogoExtension()?.length ?? 0) > 0;
    });

    this.placeCompetitorItems = this.category.getRootRound().getPlaces().map((place: Place): PlaceCompetitorItem => {
      const startLocation = place.getStartLocation();
      if (startLocation === undefined) {
        throw Error('rootroundplace should always have startLocation');
      }
      return { place, competitor: <TournamentCompetitor | undefined>this.startLocationMap.getCompetitor(startLocation) };
    });
  }

  allPlacesHaveACompetitor(): boolean {
    return this.placeCompetitorItems.every((item: PlaceCompetitorItem) => item.competitor !== undefined);
  }

  atLeastTwoPlacesHaveACompetitor(): boolean {
    let firstCompetitor: TournamentCompetitor | undefined;
    return this.placeCompetitorItems.some((item: PlaceCompetitorItem) => {
      if (firstCompetitor === undefined) {
        firstCompetitor = item.competitor;
      }
      return firstCompetitor !== undefined && item.competitor !== undefined && firstCompetitor !== item.competitor;
    });
  }

  getSwapSwitchId(place: Place): string {
    return 'swap-' + place.getId();
  }

  public swap(placeCompetitorItem: PlaceCompetitorItem) {
    // this.resetAlert();
    if (this.swapItem === undefined) {
      this.swapItem = placeCompetitorItem;
      return;
    } else if (this.swapItem === placeCompetitorItem) {
      this.swapItem = undefined;
      return;
    }
    const swapCompetitorOne = this.swapItem.competitor;
    const swapCompetitorTwo = placeCompetitorItem.competitor;
    if (swapCompetitorOne !== undefined && swapCompetitorTwo !== undefined) {
      this.swapTwo(swapCompetitorOne, swapCompetitorTwo);
    }
  }

  

  swapTwo(swappedItem: TournamentCompetitor, substitute: TournamentCompetitor): void {
    this.processing = true;
    this.swapHelper(
      [this.competitorRepository.swapObjects(swappedItem, substitute, this.tournament)]);
  }

  swapAll() {
    this.processing = true;

    let reposUpdates: Observable<void>[] = [];
    const competitors = this.tournament.getCompetitors().slice();
    let swapCompetitor: TournamentCompetitor | undefined;
    while (competitors.length > 1) {
      if (swapCompetitor === undefined) {
        swapCompetitor = competitors.shift();
        continue;
      }
      const idx = this.getRandomInt(competitors.length);
      reposUpdates.push(this.competitorRepository.swapObjects(swapCompetitor, competitors[idx], this.tournament));
      swapCompetitor = undefined;
    }
    this.swapHelper(reposUpdates);
  }

  private getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  protected swapHelper(reposUpdates: Observable<void>[]) {
    forkJoin(reposUpdates)
      .subscribe({
        next: () => {          
          this.processing = false;
          this.swapItem = undefined;
          this.competitorsUpdate.emit();
        },
        error: (e) => {
          this.processing = false;
          this.swapItem = undefined;
          this.competitorsUpdate.emit();
          this.alert.emit({ type: IAlertType.Danger, message: e });
        }
      });
  }

  // protected setAlert(type: IAlertType, message: string) {
  //   this.alert = { 'type': type, 'message': message };
  // }

  // protected resetAlert(): void {
  //   this.alert = undefined;
  // }

  hasImg(competitor: TournamentCompetitor | undefined): boolean {
    if (competitor === undefined) {
      return false;
    }
    return (competitor.getLogoExtension()?.length ?? 0) > 0;
  }

  getImgUrl(competitor: TournamentCompetitor | undefined): string {
    if (competitor === undefined) {
      throw new Error('should have competitor');
    }
    const logoExtension = competitor.getLogoExtension() ?? '';
    if (logoExtension.length === 0) {
      return '';
    }
    return this.competitorRepository.getLogoUrl(competitor);
  }
}

