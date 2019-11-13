import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Competitor,
  CompetitorRepository,
  NameService,
  Place,
  PlaceLocation,
  PlaceRepository,
  PlanningRepository,
  QualifyGroup,
  Round,
  Structure,
  StructureRepository,
} from 'ngx-sport';
import { forkJoin, Observable } from 'rxjs';

import { IAlert } from '../../common/alert';
import { MyNavigation } from '../../common/navigation';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';
import { CompetitorListRemoveModalComponent } from './listremovemodal.component';

@Component({
  selector: 'app-tournament-competitors',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompetitorListComponent extends TournamentComponent implements OnInit, AfterViewChecked {

  places: Place[];
  alert: IAlert;
  placeToSwap: Place;
  focusId: number;
  showSwap: boolean;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    private placeRepository: PlaceRepository,
    private competitorRepository: CompetitorRepository,
    public nameService: NameService,
    private modalService: NgbModal,
    private myNavigation: MyNavigation
  ) {
    super(route, router, tournamentRepository, sructureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.initPlaces();
    });
  }

  initPlaces() {
    const round = this.structure.getRootRound();
    round.getPlaces().forEach(place => {
      if (place.getCompetitor() === undefined && this.focusId === undefined) {
        this.focusId = place.getId();
      }
    });
    this.places = round.getPlaces();
    const hasBegun = this.hasBegun();
    this.showSwap = !hasBegun && this.atLeastTwoPlaceHaveCompetitor();
    this.processing = false;
  }

  ngAfterViewChecked() {
    this.myNavigation.scroll();
  }

  hasBegun() {
    return this.structure.getRootRound().hasBegun();
  }

  allPlaceHaveCompetitor() {
    return !this.places.some(place => place.getCompetitor() === undefined);
  }

  atLeastTwoPlaceHaveCompetitor() {
    return this.places.filter(place => place.getCompetitor() !== undefined).length >= 2;
  }

  editPlace(place: Place) {
    this.linkToEdit(this.tournament, place);
  }

  linkToEdit(tournament: Tournament, place: Place) {
    this.router.navigate(
      ['/toernooi/competitoredit', tournament.getId(), place.getId()]
    );
  }

  swapTwo(placeToSwap: Place) {
    this.resetAlert();
    if (this.placeToSwap === undefined) {
      this.placeToSwap = placeToSwap;
      this.setAlert('info', 'selecteer tweede deelnemer om volgorde te wijzigen');
      return;
    }
    if (this.placeToSwap === placeToSwap) {
      this.placeToSwap = undefined;
      return;
    }
    this.processing = true;
    this.setAlert('info', 'volgorde wordt gewijzigd');
    const tmp = this.placeToSwap.getCompetitor();
    this.placeToSwap.setCompetitor(placeToSwap.getCompetitor());
    placeToSwap.setCompetitor(tmp);

    const reposUpdates: Observable<Place>[] = [];
    reposUpdates.push(this.placeRepository.editObject(this.placeToSwap, this.placeToSwap.getPoule()));
    reposUpdates.push(this.placeRepository.editObject(placeToSwap, placeToSwap.getPoule()));

    this.swapHelper(reposUpdates);
  }

  swapAll() {
    this.processing = true;
    this.setAlert('info', 'volgorde wordt willekeurig gewijzigd');
    const placesCopy = this.places.slice();
    const competitors = this.structure.getRootRound().getCompetitors();
    while (competitors.length > 0) {
      const placeIndex = Math.floor(Math.random() * placesCopy.length) + 1;
      placesCopy[placeIndex - 1].setCompetitor(competitors.pop());
      placesCopy.splice(placeIndex - 1, 1);
    }
    const reposUpdates: Observable<Place>[] = [];
    this.places.forEach(placeIt => reposUpdates.push(this.placeRepository.editObject(placeIt, placeIt.getPoule())));
    this.swapHelper(reposUpdates);
  }

  protected swapHelper(reposUpdates: Observable<Place>[]) {
    forkJoin(reposUpdates).subscribe(results => {
      this.setAlert('success', 'volgorde gewijzigd');
      this.placeToSwap = undefined;
      this.processing = false;
    },
      err => {
        this.setAlert('danger', 'volgorde niet gewijzigd: ' + err);
        this.placeToSwap = undefined;
        this.processing = false;
      }
    );
  }

  addPlaceToRootRound(): void {
    this.processing = true;
    this.setAlert('info', 'er wordt een pouleplek toegevoegd');
    try {
      const rootRound = this.structure.getRootRound();
      const competitorLocations = this.getCompetitorLocations(rootRound);
      const structureService = this.getStructureService();
      const addedPlace = structureService.addPlaceToRootRound(rootRound);
      this.setCompetitors(rootRound, competitorLocations);
      this.saveStructure('pouleplek ' + this.nameService.getPlaceName(addedPlace) + ' is toegevoegd');
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  getCompetitorLocations(rootRound: Round): CompetitorLocation[] {
    const competitorLocations: CompetitorLocation[] = [];
    rootRound.getPlaces().forEach(place => {
      competitorLocations.push({ placeLocation: place.getLocation(), competitor: place.getCompetitor() });
    });
    return competitorLocations;
  }

  setCompetitors(rootRound: Round, competitorLocations: CompetitorLocation[]) {
    competitorLocations.forEach(competitorLocation => {
      const poule = rootRound.getPoule(competitorLocation.placeLocation.getPouleNr());
      const place = poule.getPlace(competitorLocation.placeLocation.getPlaceNr());
      if (place !== undefined) { // can be undefined if place is removed
        place.setCompetitor(competitorLocation.competitor);
      }
    });
  }

  preRemove(place: Place) {
    const activeModal = this.modalService.open(CompetitorListRemoveModalComponent/*, { windowClass: 'border-warning' }*/);
    (<CompetitorListRemoveModalComponent>activeModal.componentInstance).place = place;
    activeModal.result.then((result) => {
      if (result === 'remove-place') {
        this.removePlaceFromRootRound(place);
      } else if (result === 'remove-competitor') {
        this.removeCompetitor(place);
      } else if (result === 'to-structure') {
        this.processing = true;
        this.router.navigate(['/toernooi/structure', this.tournament.getId()]);
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
  registerCompetitor(competitor: Competitor): void {
    this.processing = true;
    const newRegistered = competitor.getRegistered() === true ? false : true;
    competitor.setRegistered(newRegistered);
    const prefix = newRegistered ? 'aan' : 'af';
    this.setAlert('info', 'deelnemer ' + competitor.getName() + ' wordt ' + prefix + 'gemeld');
    this.competitorRepository.editObject(competitor)
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
    const competitor = place.getCompetitor() !== undefined ? place.getCompetitor().getName() : '';
    place.setCompetitor(undefined);
    this.setAlert('info', 'deelnemer ' + competitor + ' wordt verwijderd');
    this.placeRepository.editObject(place, place.getPoule())
      .subscribe(
            /* happy path */ placeRes => {
          this.setAlert('success', 'deelnemer ' + competitor + ' is verwijderd');
        },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
      );
  }

  /**
   * @param place
   */
  removePlaceFromRootRound(place: Place): void {
    this.processing = true;
    const rootRound = this.structure.getRootRound();
    const competitor = place.getCompetitor() !== undefined ? ' en deelnemer ' + place.getCompetitor().getName() : '';
    const singledoubleWill = place.getCompetitor() !== undefined ? 'worden' : 'wordt';
    this.setAlert('info', 'een pouleplek' + competitor + ' ' + singledoubleWill + ' verwijderd');
    try {
      place.setCompetitor(rootRound.getFirstPlace(QualifyGroup.LOSERS).getCompetitor());
      const competitorLocations = this.getCompetitorLocations(rootRound);
      this.getStructureService().removePlaceFromRootRound(rootRound);
      this.setCompetitors(rootRound, competitorLocations);
      const singledoubleIs = place.getCompetitor() !== undefined ? 'zijn' : 'is';
      this.saveStructure('een pouleplek' + competitor + ' ' + singledoubleIs + ' verwijderd');
    } catch (e) {
      this.processing = false;
      this.setAlert('danger', e.message);
    }
  }

  protected saveStructure(message: string) {
    this.structureRepository.editObject(this.structure, this.competition)
      .subscribe(
          /* happy path */(structure: Structure) => {
          this.structure = structure;
          this.planningRepository.createObject(this.structure.getFirstRoundNumber(), this.tournament.getBreak())
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
