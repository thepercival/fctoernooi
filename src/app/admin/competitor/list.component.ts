import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Competitor,
  NameService,
  Place,
  Structure,
  CompetitorMap,
  StructureEditor,
} from 'ngx-sport';
import { forkJoin, Observable } from 'rxjs';

import { MyNavigation } from '../../shared/common/navigation';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { CompetitorListRemoveModalComponent } from './listremovemodal.component';
import { LockerRoomValidator } from '../../lib/lockerroom/validator';
import { TournamentCompetitor } from '../../lib/competitor';
import { CompetitorMapper } from '../../lib/competitor/mapper';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';

@Component({
  selector: 'app-tournament-competitors',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompetitorListComponent extends TournamentComponent implements OnInit, AfterViewChecked {
  public placeCompetitorItems: PlaceCompetitorItem[] = [];
  swapItem: PlaceCompetitorItem | undefined;
  focusId!: number | string;
  orderMode = false;
  hasBegun!: boolean;
  lockerRoomValidator!: LockerRoomValidator;
  areSomeCompetitorsArranged!: boolean;
  public nameService!: NameService;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    private structureEditor: StructureEditor,
    private planningRepository: PlanningRepository,
    private competitorRepository: CompetitorRepository,
    private mapper: CompetitorMapper,
    private modalService: NgbModal,
    private myNavigation: MyNavigation
  ) {
    super(route, router, tournamentRepository, sructureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      const competitors = this.tournament.getCompetitors();
      const competitorMap = new CompetitorMap(competitors);
      this.nameService = new NameService(competitorMap);
      this.lockerRoomValidator = new LockerRoomValidator(competitors, this.tournament.getLockerRooms());
      this.areSomeCompetitorsArranged = this.lockerRoomValidator.areSomeArranged(); // caching
      this.placeCompetitorItems = this.getPlaceCompetitorItems();
      this.initFocus(competitorMap);
      this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
      this.processing = false;
    });
  }

  alertType(): string { return this.alert?.type ?? 'danger' }
  alertMessage(): string { return this.alert?.message ?? '' }

  ngAfterViewChecked() {
    this.myNavigation.scroll();
  }

  initFocus(competitorMap: CompetitorMap) {
    this.structure.getRootRound().getPlaces().every(place => {
      if (competitorMap.getCompetitor(place) === undefined) {
        this.focusId = place.getId();
      }
      return this.focusId === undefined;
    });
  }

  toggleView() {
    this.orderMode = !this.orderMode;
    this.resetAlert();
  }

  getPlaceCompetitorItems(): PlaceCompetitorItem[] {
    const competitorMap = new CompetitorMap(this.tournament.getCompetitors());
    return this.structure.getRootRound().getPlaces().map((place: Place): PlaceCompetitorItem => {
      return { place, competitor: <TournamentCompetitor>competitorMap.getCompetitor(place) };
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

  showLockerRoomNotArranged(competitor: Competitor | undefined): boolean {
    return competitor !== undefined && this.areSomeCompetitorsArranged && !this.lockerRoomValidator.isArranged(competitor);
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

  swapTwo(secondSwapItem: PlaceCompetitorItem) {
    this.resetAlert();
    if (this.swapItem === undefined) {
      this.swapItem = secondSwapItem;
      return;
    }
    if (this.swapItem === secondSwapItem) {
      this.swapItem = undefined;
      return;
    }
    const swapCompetitorOne = this.swapItem.competitor;
    const swapCompetitorTwo = secondSwapItem.competitor;
    if (!swapCompetitorOne || !swapCompetitorTwo) {
      return;
    }
    this.processing = true;
    this.setAlert('info', 'volgorde wordt gewijzigd');
    this.swapHelper(
      [this.competitorRepository.swapObjects(swapCompetitorOne, swapCompetitorTwo, this.tournament)]);
  }

  swapAll() {
    this.processing = true;
    this.setAlert('info', 'volgorde wordt willekeurig gewijzigd');

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
    forkJoin(reposUpdates).subscribe(results => {
      this.setAlert('success', 'volgorde gewijzigd');
      this.swapItem = undefined;
      this.placeCompetitorItems = this.getPlaceCompetitorItems();
      this.processing = false;
    },
      err => {
        this.setAlert('danger', 'volgorde niet gewijzigd: ' + err);
        this.swapItem = undefined;
        this.placeCompetitorItems = this.getPlaceCompetitorItems();
        this.processing = false;
      }
    );
  }

  addPlaceToRootRound(): void {
    this.processing = true;
    this.setAlert('info', 'er wordt een pouleplek toegevoegd');
    try {
      const rootRound = this.structure.getRootRound();
      const addedPlace = this.structureEditor.addPlaceToRootRound(rootRound);
      this.saveStructure('pouleplek ' + this.nameService.getPlaceName(addedPlace) + ' is toegevoegd');
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  preRemove(item: PlaceCompetitorItem) {
    const activeModal = this.modalService.open(CompetitorListRemoveModalComponent);
    activeModal.componentInstance.item = item;
    activeModal.componentInstance.allPlacesAssigned = this.allPlacesHaveACompetitor();

    activeModal.result.then((result) => {
      if (result === 'remove-place') {
        this.removePlaceFromRootRound(item);
      } else if (result === 'remove-competitor' && item.competitor) {
        this.removeCompetitor(item.competitor);
      } else if (result === 'to-structure') {
        this.processing = true;
        this.router.navigate(['/admin/structure', this.tournament.getId()]);
      }
    }, (reason) => {
    });
  }

  hasMinimumNrOfPlacesPerPoule(): boolean {
    const rootRound = this.structure.getRootRound();
    return (rootRound.getPoules().length * 2) === rootRound.getNrOfPlaces();
  }

  hasNoDropouts(): boolean {
    const rootRound = this.structure.getRootRound();
    return rootRound.getNrOfPlaces() <= rootRound.getNrOfPlacesChildren();
  }

  /**
   * verwijder de deelnemer van de pouleplek
   */
  registerCompetitor(competitor: TournamentCompetitor): void {
    this.processing = true;
    const jsonCompetitor = this.mapper.toJson(competitor);
    jsonCompetitor.registered = competitor.getRegistered() === true ? false : true;
    const prefix = jsonCompetitor.registered ? 'aan' : 'af';
    this.setAlert('info', 'deelnemer ' + competitor.getName() + ' wordt ' + prefix + 'gemeld');
    this.competitorRepository.editObject(jsonCompetitor, competitor, this.tournament)
      .subscribe(
            /* happy path */(competitorRes: TournamentCompetitor) => {
          this.setAlert('success', 'deelnemer ' + competitor.getName() + ' is ' + prefix + 'gemeld');
        },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
      );
  }

  getSwapSwitchId(place: Place): string {
    return 'swap-' + place.getId();
  }

  removeCompetitor(competitor: TournamentCompetitor): void {
    this.processing = true;
    this.setAlert('info', 'deelnemer ' + competitor.getName() + ' wordt verwijderd');
    this.competitorRepository.removeObject(competitor, this.tournament)
      .subscribe(
            /* happy path */() => {
          this.placeCompetitorItems = this.getPlaceCompetitorItems();

          this.setAlert('success', 'deelnemer ' + competitor + ' is verwijderd');
        },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
      );
  }

  removePlaceFromRootRound(item: PlaceCompetitorItem): void {
    this.processing = true;
    const rootRound = this.structure.getRootRound();
    const competitor = item.competitor;
    const suffix = competitor ? ' en deelnemer "' + competitor.getName() : '"';
    const singledoubleWill = competitor ? 'worden' : 'wordt';
    this.setAlert('info', 'een pouleplek' + suffix + ' ' + singledoubleWill + ' verwijderd');
    try {
      this.structureEditor.removePlaceFromRootRound(rootRound);
      const singledoubleIs = competitor ? 'zijn' : 'is';
      this.saveStructure('een pouleplek' + competitor + ' ' + singledoubleIs + ' verwijderd');
    } catch (e) {
      this.processing = false;
      this.setAlert('danger', e.message);
    }
  }

  protected saveStructure(message: string) {
    this.structureRepository.editObject(this.structure, this.tournament)
      .subscribe(
          /* happy path */(structure: Structure) => {
          this.structure = structure;
          this.planningRepository.create(this.structure, this.tournament, 1)
            .subscribe(
                    /* happy path */ roundNumberOut => {
                this.placeCompetitorItems = this.getPlaceCompetitorItems();
                this.setAlert('success', message);
              },
                  /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                  /* onComplete */() => this.processing = false
            );
        },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
      );
  }
}

