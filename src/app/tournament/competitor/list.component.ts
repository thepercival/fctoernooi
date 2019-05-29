import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Competitor,
  CompetitorRepository,
  NameService,
  PlaceLocation,
  PlanningRepository,
  PlanningService,
  PoulePlace,
  PoulePlaceRepository,
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
import { TournamentService } from '../../lib/tournament/service';
import { TournamentComponent } from '../component';
import { TournamentListRemoveModalComponent } from './listremovemodal.component';

@Component({
  selector: 'app-tournament-competitors',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompetitorListComponent extends TournamentComponent implements OnInit, AfterViewChecked {

  poulePlaces: PoulePlace[];
  alert: IAlert;
  poulePlaceToSwap: PoulePlace;
  focusId: number;
  showSwap: boolean;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    private poulePlaceRepository: PoulePlaceRepository,
    private competitorRepository: CompetitorRepository,
    public nameService: NameService,
    private modalService: NgbModal,
    private myNavigation: MyNavigation
  ) {
    super(route, router, tournamentRepository, sructureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.initPoulePlaces();
    });
  }

  initPoulePlaces() {
    const round = this.structure.getRootRound();
    round.getPlaces().forEach(poulePlace => {
      if (poulePlace.getCompetitor() === undefined && this.focusId === undefined) {
        this.focusId = poulePlace.getId();
      }
    });
    this.poulePlaces = round.getPlaces();
    const isStarted = this.isStarted();
    this.showSwap = !isStarted && this.atLeastTwoPoulePlaceHaveCompetitor();
    this.processing = false;
  }

  ngAfterViewChecked() {
    this.myNavigation.scroll();
  }

  isStarted() {
    return this.structure.getRootRound().isStarted();
  }

  allPoulePlaceHaveCompetitor() {
    return !this.poulePlaces.some(poulePlace => poulePlace.getCompetitor() === undefined);
  }

  atLeastTwoPoulePlaceHaveCompetitor() {
    return this.poulePlaces.filter(poulePlace => poulePlace.getCompetitor() !== undefined).length >= 2;
  }

  editPoulePlace(poulePlace: PoulePlace) {
    this.linkToEdit(this.tournament, poulePlace);
  }

  linkToEdit(tournament: Tournament, poulePlace: PoulePlace) {
    this.router.navigate(
      ['/toernooi/competitoredit', tournament.getId(), poulePlace.getId()]
    );
  }

  swapTwo(poulePlaceToSwap: PoulePlace) {
    this.resetAlert();
    if (this.poulePlaceToSwap === undefined) {
      this.poulePlaceToSwap = poulePlaceToSwap;
      this.setAlert('info', 'selecteer tweede deelnemer om volgorde te wijzigen');
      return;
    }
    if (this.poulePlaceToSwap === poulePlaceToSwap) {
      this.poulePlaceToSwap = undefined;
      return;
    }
    this.processing = true;
    this.setAlert('info', 'volgorde wordt gewijzigd');
    const tmp = this.poulePlaceToSwap.getCompetitor();
    this.poulePlaceToSwap.setCompetitor(poulePlaceToSwap.getCompetitor());
    poulePlaceToSwap.setCompetitor(tmp);

    const reposUpdates: Observable<PoulePlace>[] = [];
    reposUpdates.push(this.poulePlaceRepository.editObject(this.poulePlaceToSwap, this.poulePlaceToSwap.getPoule()));
    reposUpdates.push(this.poulePlaceRepository.editObject(poulePlaceToSwap, poulePlaceToSwap.getPoule()));

    this.swapHelper(reposUpdates);
  }

  swapAll() {
    this.processing = true;
    this.setAlert('info', 'volgorde wordt willekeurig gewijzigd');
    const poulePlacesCopy = this.poulePlaces.slice();
    const competitors = this.structure.getRootRound().getCompetitors();
    while (competitors.length > 0) {
      const poulePlaceIndex = Math.floor(Math.random() * poulePlacesCopy.length) + 1;
      poulePlacesCopy[poulePlaceIndex - 1].setCompetitor(competitors.pop());
      poulePlacesCopy.splice(poulePlaceIndex - 1, 1);
    }
    const reposUpdates: Observable<PoulePlace>[] = [];
    this.poulePlaces.forEach(poulePlace => reposUpdates.push(this.poulePlaceRepository.editObject(poulePlace, poulePlace.getPoule())));
    this.swapHelper(reposUpdates);
  }

  protected swapHelper(reposUpdates: Observable<PoulePlace>[]) {
    forkJoin(reposUpdates).subscribe(results => {
      this.setAlert('success', 'volgorde gewijzigd');
      this.poulePlaceToSwap = undefined;
      this.processing = false;
    },
      err => {
        this.setAlert('danger', 'volgorde niet gewijzigd: ' + err);
        this.poulePlaceToSwap = undefined;
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
      const addedPoulePlace = structureService.addPlaceToRootRound(rootRound);
      this.setCompetitors(rootRound, competitorLocations);
      this.saveStructure('pouleplek ' + this.nameService.getPoulePlaceName(addedPoulePlace) + ' is toegevoegd');
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

  preRemove(poulePlace: PoulePlace) {
    const activeModal = this.modalService.open(TournamentListRemoveModalComponent/*, { windowClass: 'border-warning' }*/);
    (<TournamentListRemoveModalComponent>activeModal.componentInstance).poulePlace = poulePlace;
    activeModal.result.then((result) => {
      if (result === 'remove-pouleplace') {
        this.removePoulePlaceFromRootRound(poulePlace);
      } else if (result === 'remove-competitor') {
        this.removeCompetitor(poulePlace);
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
  removeCompetitor(poulePlace: PoulePlace): void {
    this.processing = true;
    const competitor = poulePlace.getCompetitor() !== undefined ? poulePlace.getCompetitor().getName() : '';
    poulePlace.setCompetitor(undefined);
    this.setAlert('info', 'deelnemer ' + competitor + ' wordt verwijderd');
    this.poulePlaceRepository.editObject(poulePlace, poulePlace.getPoule())
      .subscribe(
            /* happy path */ poulePlaceRes => {
          this.setAlert('success', 'deelnemer ' + competitor + ' is verwijderd');
        },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
      );
  }

  /**
   * 
   * @param poulePlace 
   */
  removePoulePlaceFromRootRound(poulePlace: PoulePlace): void {
    this.processing = true;
    const rootRound = this.structure.getRootRound();
    const competitor = poulePlace.getCompetitor() !== undefined ? ' en deelnemer ' + poulePlace.getCompetitor().getName() : '';
    const singledoubleWill = poulePlace.getCompetitor() !== undefined ? 'worden' : 'wordt';
    this.setAlert('info', 'een pouleplek' + competitor + ' ' + singledoubleWill + ' verwijderd');
    try {
      poulePlace.setCompetitor(rootRound.getFirstPlace(QualifyGroup.LOSERS).getCompetitor());
      const competitorLocations = this.getCompetitorLocations(rootRound);
      this.getStructureService().removePlaceFromRootRound(rootRound);
      this.setCompetitors(rootRound, competitorLocations);
      const singledoubleIs = poulePlace.getCompetitor() !== undefined ? 'zijn' : 'is';
      this.saveStructure('een pouleplek' + competitor + ' ' + singledoubleIs + ' verwijderd');
    } catch (e) {
      this.processing = false;
      this.setAlert('danger', e.message);
    }
  }

  protected saveStructure(message: string) {
    this.structureRepository.editObject(this.structure, this.tournament.getCompetition())
      .subscribe(
          /* happy path */(structure: Structure) => {
          this.structure = structure;
          const planningService = new PlanningService(this.tournament.getCompetition());
          const tournamentService = new TournamentService(this.tournament);
          tournamentService.create(planningService, this.structure.getFirstRoundNumber());
          this.planningRepository.createObject(this.structure.getFirstRoundNumber())
            .subscribe(
                    /* happy path */ games => {
                this.initPoulePlaces();
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
