import { Component, Input, OnChanges, OnInit, output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Category, Competitor, Place, StartLocationMap, StructureNameService } from 'ngx-sport';
import { forkJoin, Observable } from 'rxjs';
import { TournamentCompetitor } from '../../lib/competitor';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { Tournament } from '../../lib/tournament';
import { IAlert, IAlertType } from '../../shared/common/alert';

@Component({
  selector: 'app-tournament-category-competitors-order',
  templateUrl: './category.order.component.html',
  styleUrls: ['./category.order.component.scss']
})
export class CategoryOrderCompetitorListComponent implements OnChanges, OnInit {
  @Input() tournament!: Tournament;
  @Input() category!: Category;
  @Input() showHeader!: boolean;
  @Input() structureNameService!: StructureNameService;
  @Input() activeTab!: number;

  onAlertChange = output<IAlert>();  
  onCompetitorsUpdate = output<void>();

  public placeCompetitorItems: PlaceCompetitorItem[] = [];
  public orderMode = false;
  public swapItem: PlaceCompetitorItem | undefined;
  private startLocationMap!: StartLocationMap;
  public hasSomeCompetitorAnImage: boolean = false;
  // public alert: IAlert | undefined;
  public processing = false;

  constructor(
    public competitorRepository: CompetitorRepository) {
  }

  ngOnInit(): void {
    console.log(this.category);
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
    this.hasSomeCompetitorAnImage = this.hasSomeCompetitorAnImage = this.competitorRepository.hasSomeLogo(this.tournament.getCompetitors())

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

  swapAll(category: Category) {
    this.processing = true;

    let reposUpdates: Observable<void>[] = [];
    const competitors = this.getValidCompetitorsForCategory(category);
    while (competitors.length > 1) {
      const swapCompetitorA = competitors.shift();      
      let idx = this.getRandomInt(competitors.length);
      const removedCompetitors = competitors.splice(idx, 1);
      const swapCompetitorB = removedCompetitors.shift();
      if ( swapCompetitorA === undefined || swapCompetitorB === undefined) {
        continue;
      }
      reposUpdates.push(this.competitorRepository.swapObjects(swapCompetitorA, swapCompetitorB, this.tournament));      
    }
    this.swapHelper(reposUpdates);
  }

  getValidCompetitorsForCategory(category: Category): TournamentCompetitor[] {
    const rootRound = category.getRootRound();
    return this.tournament.getCompetitors().filter((competitor: Competitor): boolean => {
      try {
        const poule = rootRound.getPoule(competitor.getStartLocation().getPouleNr());
        poule.getPlace(competitor.getStartLocation().getPlaceNr());
        return competitor.getStartLocation().getCategoryNr() === category.getNumber();
      } catch( e) {
        return false;
      }      
    });
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
          this.onCompetitorsUpdate.emit();
        },
        error: (e) => {
          this.processing = false;
          this.swapItem = undefined;
          this.onCompetitorsUpdate.emit();
          this.onAlertChange.emit({ type: IAlertType.Danger, message: e });
        }
      });
  }

  // protected setAlert(type: IAlertType, message: string) {
  //   this.alert = { 'type': type, 'message': message };
  // }

  // protected resetAlert(): void {
  //   this.alert = undefined;
  // }
}

