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
  selector: 'app-tournament-category-competitors-base',
  templateUrl: './category.base.component.html',
  styleUrls: ['./category.base.component.scss']
})
export class CategoryBaseCompetitorListComponent implements OnInit, OnChanges {
  @Input() tournament!: Tournament;
  @Input() category!: Category;
  @Input() showHeader!: boolean;
  @Input() structureNameService!: StructureNameService;
  @Input() lockerRoomValidator!: LockerRoomValidator;
  @Input() focusId!: string | number;
  @Input() activeTab!: number;

  @Output() alert = new EventEmitter<IAlert>();
  @Output() processing = new EventEmitter<string>();
  @Output() removeCompetitor = new EventEmitter<TournamentCompetitor>();
  @Output() saveStructure = new EventEmitter<string>();

  public placeCompetitorItems: PlaceCompetitorItem[] = [];
  public orderMode = false;
  public hasBegun = true;
  public swapItem: PlaceCompetitorItem | undefined;
  private startLocationMap!: StartLocationMap;
  private areSomeCompetitorsArranged: boolean = false;
  public hasSomeCompetitorAnImage: boolean = false;
  public toClipboardMessage: string | undefined;

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
        this.updatePlaceCompetitorItems();
      }
    }
    if (changes.lockerRoomValidator !== undefined
      && changes.lockerRoomValidator.currentValue !== changes.lockerRoomValidator.previousValue
      /*&& changes.structureNameService.firstChange === false*/) {
      // this.updateItems();
      this.areSomeCompetitorsArranged = this.lockerRoomValidator.areSomeArranged(); // caching
    }
  }

  updatePlaceCompetitorItems(): void {
    this.hasSomeCompetitorAnImage = this.competitorRepository.hasSomeLogo(this.tournament.getCompetitors())
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

  showLockerRoomNotArranged(competitor: Competitor | undefined): boolean {
    return competitor !== undefined && this.areSomeCompetitorsArranged && !this.lockerRoomValidator.isArranged(competitor);
  }

  someCompetitorHasTelephone(): boolean {
    return this.placeCompetitorItems.some((placeCompetitorItem: PlaceCompetitorItem): boolean => {
      const telephone  = placeCompetitorItem.competitor?.getTelephone() ?? '';
      return telephone.length > 0;
    })
  }

  someCompetitorHasEmailaddress(): boolean {
    return this.placeCompetitorItems.some((placeCompetitorItem: PlaceCompetitorItem): boolean => {
      const telephone = placeCompetitorItem.competitor?.getEmailaddress() ?? '';
      return telephone.length > 0;
    })
  }

  getTelephones(): string {
    return this.placeCompetitorItems.map((placeCompetitorItem: PlaceCompetitorItem): string => {
      return placeCompetitorItem.competitor?.getTelephone() ?? '';
    }).join(';') 
  }

  getEmailaddresses(): string {
    return this.placeCompetitorItems.map((placeCompetitorItem: PlaceCompetitorItem): string => {
      return placeCompetitorItem.competitor?.getEmailaddress() ?? '';
    }).join(';') 
  }

  toggleView() {
    this.orderMode = !this.orderMode;
  }

  editPlace(place: Place) {
    this.linkToEdit(this.tournament, place);
  }

  linkToEdit(tournament: Tournament, place: Place) {
    this.router.navigate(
      ['/admin/competitor', tournament.getId(), place.getRound().getCategory().getNumber(), place.getPouleNr(), place.getPlaceNr()]
    );
  }

  addPlace(): void {
    this.processing.emit('er wordt een pouleplek toegevoegd');
    try {
      const addedPlace = this.structureEditor.addPlaceToRootRound(this.category.getRootRound());
      this.saveStructure.emit('pouleplek ' + this.structureNameService.getPlaceName(addedPlace) + ' is toegevoegd');
    } catch (e: any) {
      this.processing.emit('');
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
    
    const suffix = competitor ? ' en deelnemer "' + competitor.getName() + '"' : '';
    const singledoubleWill = competitor ? 'worden' : 'wordt';
    this.processing.emit('een pouleplek' + suffix + ' ' + singledoubleWill + ' verwijderd');
    try {
      this.structureEditor.removePlaceFromRootRound(rootRound);
      const singledoubleIs = competitor ? 'zijn' : 'is';
      this.saveStructure.emit('een pouleplek' + suffix + ' ' + singledoubleIs + ' verwijderd');
    } catch (e: any) {
      this.processing.emit('');
      this.alert.emit({ type: IAlertType.Danger, message: e.message });
    }
  }

  // protected setAlert(type: IAlertType, message: string) {
  //   this.alert = { 'type': type, 'message': message };
  // }

  // protected resetAlert(): void {
  //   this.alert = undefined;
  // }
}

