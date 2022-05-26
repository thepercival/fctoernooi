import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Category, Competitor, Place, StartLocationMap, StructureEditor, StructureNameService } from 'ngx-sport';
import { forkJoin, Observable } from 'rxjs';
import { TournamentCompetitor } from '../../lib/competitor';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { Tournament } from '../../lib/tournament';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { CompetitorListRemoveModalComponent } from './listremovemodal.component';

@Component({
  selector: 'app-tournament-category-competitors',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryCompetitorListComponent implements OnInit, OnChanges {
  @Input() tournament!: Tournament;
  @Input() category!: Category;
  @Input() showHeader!: boolean;
  @Input() structureNameService!: StructureNameService;

  @Output() alert = new EventEmitter<IAlert>();
  @Output() processing = new EventEmitter<string | false>();
  @Output() removeCompetitor = new EventEmitter<TournamentCompetitor>();
  @Output() saveStructure = new EventEmitter<string>();
  @Output() structureNameServiceUpdate = new EventEmitter();

  // @Output() editPressed = new EventEmitter<Place>();
  // @Output() removePressed = new EventEmitter<PlaceCompetitorItem>();
  // @Output() registerPressed = new EventEmitter<TournamentCompetitor>();
  // @Output() toLockerRooms = new EventEmitter<void>();

  // @ViewChild('btnEdit', { static: true }) private btnEditRef: ElementRef | undefined;
  public placeCompetitorItems: PlaceCompetitorItem[] = [];
  public orderMode = false;
  public hasBegun = true;
  public swapItem: PlaceCompetitorItem | undefined;
  private startLocationMap!: StartLocationMap;
  // public alert: IAlert | undefined;

  constructor(
    private router: Router,
    private structureEditor: StructureEditor,
    private competitorRepository: CompetitorRepository,
    private modalService: NgbModal) {
  }

  ngOnInit() {
    this.hasBegun = this.category.getRootRound().hasBegun();
    // at every change of this.structureNameService

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.structureNameService !== undefined
      && changes.structureNameService.currentValue !== changes.structureNameService.previousValue
      /*&& changes.structureNameService.firstChange === false*/) {
      // this.updateItems();
      const startLocationMap = this.structureNameService.getStartLocationMap();
      if (startLocationMap) {
        this.startLocationMap = startLocationMap;
      }
    }
  }

  getPlaceCompetitorItems(): PlaceCompetitorItem[] {
    return this.category.getRootRound().getPlaces().map((place: Place): PlaceCompetitorItem => {
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

  showLockerRoomNotArranged(competitor: Competitor | undefined): boolean {
    return competitor !== undefined && this.areSomeCompetitorsArranged && !this.lockerRoomValidator.isArranged(competitor);
  }

  toggleView() {
    this.orderMode = !this.orderMode;
  }

  editPlace(place: Place) {
    this.linkToEdit(this.tournament, place);
  }

  linkToEdit(tournament: Tournament, place: Place) {
    this.router.navigate(
      ['/admin/competitor', tournament.getId(), place.getPouleNr(), place.getPlaceNr()]
    );
  }

  linkToLockerRooms() {
    this.router.navigate(
      ['/admin/lockerrooms', this.tournament.getId()]
    );
  }

  addPlace(): void {
    this.processing.emit('er wordt een pouleplek toegevoegd');
    try {
      const addedPlace = this.structureEditor.addPlaceToRootRound(this.category.getRootRound());
      this.saveStructure.emit('pouleplek ' + this.structureNameService.getPlaceName(addedPlace) + ' is toegevoegd');
    } catch (e: any) {
      this.processing.emit(false);
      this.alert.emit({ type: IAlertType.Danger, message: e.message });
    }
  }

  preRemove(item: PlaceCompetitorItem) {
    const activeModal = this.modalService.open(CompetitorListRemoveModalComponent);
    activeModal.componentInstance.item = item;
    activeModal.componentInstance.allPlacesAssigned = this.allPlacesHaveACompetitor();

    activeModal.result.then((result) => {
      if (result === 'remove-place') {
        this.removePlace(item);
      } else if (result === 'remove-competitor' && item.competitor) {
        this.removeCompetitor.emit(item.competitor);
      } else if (result === 'to-structure') {
        this.router.navigate(['/admin/structure', this.tournament.getId()]);
      }
    }, (reason) => {
    });
  }

  removePlace(item: PlaceCompetitorItem): void {

    const rootRound = this.category.getRootRound();
    const competitor = item.competitor;
    const suffix = competitor ? ' en deelnemer "' + competitor.getName() : '"';
    const singledoubleWill = competitor ? 'worden' : 'wordt';
    this.processing.emit('een pouleplek' + suffix + ' ' + singledoubleWill + ' verwijderd');
    try {
      this.structureEditor.removePlaceFromRootRound(rootRound);
      const singledoubleIs = competitor ? 'zijn' : 'is';
      this.saveStructure.emit('een pouleplek' + competitor + ' ' + singledoubleIs + ' verwijderd');
    } catch (e: any) {
      this.processing.emit(false);
      this.alert.emit({ type: IAlertType.Danger, message: e.message });
    }
  }

  swapTwo(swappedItem: TournamentCompetitor, substitute: TournamentCompetitor): void {
    this.processing.emit('volgorde wordt gewijzigd');
    this.swapHelper(
      [this.competitorRepository.swapObjects(swappedItem, substitute, this.tournament)]);
  }

  swapAll() {
    this.processing.emit('volgorde wordt willekeurig gewijzigd');

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
          ///this.setAlert(IAlertType.Success, 'volgorde gewijzigd');
          this.swapItem = undefined;
          this.structureNameServiceUpdate.emit();
        },
        error: (e) => {
          // this.setAlert(IAlertType.Danger, 'volgorde niet gewijzigd: ' + e);
          this.swapItem = undefined;
          this.structureNameServiceUpdate.emit();
          this.alert.emit({ type: IAlertType.Danger, message: e.message });
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
