import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Competitor,
  NameService,
  Place,
  PlaceLocation,
  QualifyGroup,
  Round,
  Structure,
  PlaceLocationMap
} from 'ngx-sport';
import { forkJoin, Observable } from 'rxjs';

import { IAlert } from '../../shared/common/alert';
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

@Component({
  selector: 'app-tournament-competitors',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompetitorListComponent extends TournamentComponent implements OnInit, AfterViewChecked {

  places: Place[];
  alert: IAlert;
  swapPlace: Place;
  focusId: number;
  showSwap: boolean;
  orderMode = false;
  hasBegun: boolean;
  lockerRoomValidator: LockerRoomValidator;
  areSomeCompetitorsArranged: boolean;
  private placeLocationMap: PlaceLocationMap
  public nameService: NameService;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    private competitorRepository: CompetitorRepository,
    private modalService: NgbModal,
    private myNavigation: MyNavigation
  ) {
    super(route, router, tournamentRepository, sructureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      const competitors = this.tournament.getCompetitors();
      this.placeLocationMap = new PlaceLocationMap(competitors);
      this.nameService = new NameService(this.placeLocationMap);
      this.initPlaces();
      this.lockerRoomValidator = new LockerRoomValidator(competitors, this.tournament.getLockerRooms());
      this.areSomeCompetitorsArranged = this.lockerRoomValidator.areSomeArranged(); // caching
    });
  }

  initPlaces() {
    const round = this.structure.getRootRound();
    round.getPlaces().forEach(place => {
      if (!this.hasCompetitor(place) && this.focusId === undefined) {
        this.focusId = place.getId();
      }
    });
    this.places = round.getPlaces();
    this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
    this.processing = false;
  }

  ngAfterViewChecked() {
    this.myNavigation.scroll();
  }

  toggleView() {
    this.orderMode = !this.orderMode;
    this.resetAlert();
  }

  getCompetitor(place: Place) {
    return this.placeLocationMap.getCompetitor(place);
  }

  private hasCompetitor(place: Place): boolean {
    return this.getCompetitor(place) === undefined;
  }

  allPlaceHaveCompetitor() {
    return !this.places.some(place => !this.hasCompetitor(place));
  }

  atLeastTwoPlaceHaveCompetitor() {
    return this.places.filter(place => this.hasCompetitor(place)).length >= 2;
  }

  showLockerRoomNotArranged(competitor: Competitor): boolean {
    return this.areSomeCompetitorsArranged && !this.lockerRoomValidator.isArranged(competitor);
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

  swapTwo(swapPlaceTwo: Place) {
    this.resetAlert();
    if (this.swapPlace === undefined) {
      this.swapPlace = swapPlaceTwo;
      return;
    }
    if (this.swapPlace === swapPlaceTwo) {
      this.swapPlace = undefined;
      return;
    }
    this.processing = true;
    this.setAlert('info', 'volgorde wordt gewijzigd');
    const swapCompetitor = <TournamentCompetitor>this.placeLocationMap.getCompetitor(this.swapPlace);
    const swapCompetitorTwo = <TournamentCompetitor>this.placeLocationMap.getCompetitor(swapPlaceTwo);
    const reposUpdates: Observable<Competitor>[] = [];
    reposUpdates.push(this.competitorRepository.editObject(swapCompetitor, this.tournament));
    reposUpdates.push(this.competitorRepository.editObject(swapCompetitorTwo, this.tournament));
    this.swapHelper(reposUpdates);
  }

  swapAll() {
    this.processing = true;
    this.setAlert('info', 'volgorde wordt willekeurig gewijzigd');

    const reposUpdates: Observable<Competitor>[] = [];
    const competitors = this.tournament.getCompetitors();
    let swapCompetitor;
    while (competitors.length > 1) {
      const idx = Math.floor(Math.random() * competitors.length) + 1;
      if (swapCompetitor) {
        this.swap(swapCompetitor, competitors[idx]);
        reposUpdates.push(this.competitorRepository.editObject(swapCompetitor, this.tournament));
        reposUpdates.push(this.competitorRepository.editObject(competitors[idx], this.tournament));
        swapCompetitor = undefined;
      } else {
        swapCompetitor = competitors[idx];
      }
    }
    this.swapHelper(reposUpdates);
  }

  protected swap(competitorOne: TournamentCompetitor, competitorTwo: TournamentCompetitor) {
    const tmpPouleNr = competitorOne.getPouleNr();
    competitorOne.setPouleNr(competitorTwo.getPouleNr());
    competitorTwo.setPouleNr(tmpPouleNr);
    const tmpPlaceNr = competitorOne.getPlaceNr();
    competitorOne.setPlaceNr(competitorTwo.getPlaceNr());
    competitorTwo.setPlaceNr(tmpPlaceNr);
  }

  protected swapHelper(reposUpdates: Observable<Competitor>[]) {
    forkJoin(reposUpdates).subscribe(results => {
      this.setAlert('success', 'volgorde gewijzigd');
      this.swapPlace = undefined;
      this.processing = false;
    },
      err => {
        this.setAlert('danger', 'volgorde niet gewijzigd: ' + err);
        this.swapPlace = undefined;
        this.processing = false;
      }
    );
  }

  addPlaceToRootRound(): void {
    this.processing = true;
    this.setAlert('info', 'er wordt een pouleplek toegevoegd');
    try {
      const rootRound = this.structure.getRootRound();
      const structureService = this.getStructureService();
      const addedPlace = structureService.addPlaceToRootRound(rootRound);
      this.saveStructure('pouleplek ' + this.nameService.getPlaceName(addedPlace) + ' is toegevoegd');
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  preRemove(place: Place) {
    const activeModal = this.modalService.open(CompetitorListRemoveModalComponent);
    activeModal.componentInstance.place = place;
    activeModal.componentInstance.competitor = this.getCompetitor(place);
    activeModal.componentInstance.allPlacesAssigned = this.tournament.getCompetitors().length === place.getRound().getNrOfPlaces();

    activeModal.result.then((result) => {
      if (result === 'remove-place') {
        this.removePlaceFromRootRound(place);
      } else if (result === 'remove-competitor') {
        this.removeCompetitor(place);
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
    const newRegistered = competitor.getRegistered() === true ? false : true;
    competitor.setRegistered(newRegistered);
    const prefix = newRegistered ? 'aan' : 'af';
    this.setAlert('info', 'deelnemer ' + competitor.getName() + ' wordt ' + prefix + 'gemeld');
    this.competitorRepository.editObject(competitor, this.tournament)
      .subscribe(
            /* happy path */ competitorRes => {
          this.setAlert('success', 'deelnemer ' + competitor.getName() + ' is ' + prefix + 'gemeld');
        },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
      );
  }

  /**
   * verwijder de deelnemer van de pouleplek
   */
  removeCompetitor(place: Place): void {
    this.processing = true;
    const competitor = this.placeLocationMap.getCompetitor(place);
    this.setAlert('info', 'deelnemer ' + competitor.getName() + ' wordt verwijderd');
    this.competitorRepository.removeObject(competitor, this.tournament)
      .subscribe(
            /* happy path */ placeRes => {
          this.setAlert('success', 'deelnemer ' + competitor + ' is verwijderd');
        },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
      );
  }

  removePlaceFromRootRound(place: Place): void {
    this.processing = true;
    const rootRound = this.structure.getRootRound();
    const competitor = this.placeLocationMap.getCompetitor(place);
    const suffix = competitor ? ' en deelnemer ' + competitor.getName() : '';
    const singledoubleWill = competitor ? 'worden' : 'wordt';
    this.setAlert('info', 'een pouleplek' + competitor + ' ' + singledoubleWill + ' verwijderd');
    try {

      this.getStructureService().removePlaceFromRootRound(rootRound);

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
                this.initPlaces();
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

interface CompetitorLocation {
  placeLocation: PlaceLocation;
  competitor: Competitor;
}
