import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import {
  PlanningRepository,
  PlanningService,
  PoulePlace,
  PoulePlaceRepository,
  Round,
  Structure,
  NameService,
  StructureRepository,
  TeamRepository,
} from 'ngx-sport';
import { forkJoin, Observable } from 'rxjs';

import { IAlert } from '../../app.definitions';
import { Tournament } from '../../lib/tournament';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';
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
  scrollToId: number;
  focusId: number;
  showSwap: boolean;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    private teamRepository: TeamRepository,
    private poulePlaceRepository: PoulePlaceRepository,
    public nameService: NameService,
    private scrollService: ScrollToService,
    private modalService: NgbModal
  ) {
    super(route, router, tournamentRepository, sructureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => {
      this.initPoulePlaces();
    });
    this.route.queryParamMap.subscribe(params => {
      this.scrollToId = +params.get('scrollToId');
    });
  }

  initPoulePlaces() {
    const round = this.structure.getRootRound();
    round.getPoulePlaces().forEach(poulePlace => {
      if (poulePlace.getTeam() === undefined && this.focusId === undefined) {
        this.focusId = poulePlace.getId();
      }
    });
    this.poulePlaces = round.getPoulePlaces();
    const isStarted = this.isStarted();
    this.showSwap = !isStarted && this.atLeastTwoPoulePlaceHaveTeam();
    this.processing = false;
  }

  ngAfterViewChecked() {
    if (this.processing === false && this.scrollToId !== undefined) {
      this.scrollService.scrollTo({
        target: 'scroll-pouleplace-' + this.scrollToId,
        duration: 200
      });
      this.scrollToId = undefined;
    }
  }

  isStarted() {
    return this.structure.getRootRound().isStarted();
  }

  allPoulePlaceHaveTeam() {
    return !this.poulePlaces.some(poulePlace => poulePlace.getTeam() === undefined);
  }

  atLeastTwoPoulePlaceHaveTeam() {
    return this.poulePlaces.filter(poulePlace => poulePlace.getTeam() !== undefined).length >= 2;
  }

  editPoulePlace(poulePlace: PoulePlace) {
    this.linkToEdit(this.tournament, poulePlace);
  }

  linkToEdit(tournament: Tournament, poulePlace: PoulePlace) {
    this.router.navigate(
      ['/toernooi/competitoredit', tournament.getId(), poulePlace.getId()],
      {
        queryParams: {
          returnAction: '/toernooi/competitors',
          returnParam: tournament.getId()
        }
      }
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
    const teamTmp = this.poulePlaceToSwap.getTeam();
    this.poulePlaceToSwap.setTeam(poulePlaceToSwap.getTeam());
    poulePlaceToSwap.setTeam(teamTmp);

    const reposUpdates: Observable<PoulePlace>[] = [];
    reposUpdates.push(this.poulePlaceRepository.editObject(this.poulePlaceToSwap, this.poulePlaceToSwap.getPoule()));
    reposUpdates.push(this.poulePlaceRepository.editObject(poulePlaceToSwap, poulePlaceToSwap.getPoule()));

    this.swapHelper(reposUpdates);
  }

  swapAll() {
    this.processing = true;
    this.setAlert('info', 'volgorde wordt willekeurig gewijzigd');
    const poulePlacesCopy = this.poulePlaces.slice();
    const teams = this.structure.getRootRound().getTeams();
    while (teams.length > 0) {
      const poulePlaceIndex = Math.floor(Math.random() * poulePlacesCopy.length) + 1;
      poulePlacesCopy[poulePlaceIndex - 1].setTeam(teams.pop());
      poulePlacesCopy.splice(poulePlaceIndex - 1, 1);
    }
    const reposUpdates: Observable<PoulePlace>[] = [];
    this.poulePlaces.forEach(poulePlace => reposUpdates.push(this.poulePlaceRepository.editObject(poulePlace, poulePlace.getPoule())));
    this.swapHelper(reposUpdates);
  }

  protected swapHelper(reposUpdates: Observable<PoulePlace>[]) {
    forkJoin(reposUpdates).subscribe(results => {
      this.setAlert('info', 'volgorde gewijzigd');
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

  addPoulePlace(): void {
    this.processing = true;
    this.setAlert('info', 'er wordt een pouleplek toegevoegd');
    try {
      const rootRound = this.structure.getRootRound();
      const structureService = this.getStructureService();
      const addedPoulePlace = structureService.addPoulePlace(rootRound);
      this.saveStructure('pouleplek ' + this.nameService.getPoulePlaceName(addedPoulePlace) + ' is toegevoegd');
    } catch (e) {
      this.setAlert('danger', e.message);
    }
  }

  preRemove(poulePlace: PoulePlace) {
    const activeModal = this.modalService.open(TournamentListRemoveModalComponent/*, { windowClass: 'border-warning' }*/);
    (<TournamentListRemoveModalComponent>activeModal.componentInstance).poulePlace = poulePlace;
    activeModal.result.then((result) => {
      if (result === 'remove-pouleplace') {
        this.removePoulePlace(poulePlace);
      } else if (result === 'remove-competitor') {
        this.removeCompetitor(poulePlace);
      } else if (result === 'to-structure') {
        this.processing = true;
        this.router.navigate(['/toernooi/structure', this.tournament.getId()]);
      }
    }, (reason) => {
    });
  }

  hasMinimumNrOfTeamsPerPoule() {
    const rootRound = this.structure.getRootRound();
    return (rootRound.getPoules().length * 2) === rootRound.getPoulePlaces().length;
  }

  hasNoDropouts() {
    const rootRound = this.structure.getRootRound();
    return rootRound.getPoulePlaces().length <= rootRound.getNrOfPlacesChildRounds();
  }

  /**
   * verwijder het team van de pouleplek
   */
  removeCompetitor(poulePlace: PoulePlace): void {
    this.processing = true;
    const competitor = poulePlace.getTeam() !== undefined ? poulePlace.getTeam().getName() : '';
    poulePlace.setTeam(undefined);
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
   * verplaatst alle teams vanaf de te verwijderen pouleplek naar de vorige pouleplek, verwijder vervolgens de laatste pouleplek
   */
  removePoulePlace(poulePlace: PoulePlace): void {
    this.processing = true;
    const rootRound = this.structure.getRootRound();
    const competitor = poulePlace.getTeam() !== undefined ? ' en deelnemer ' + poulePlace.getTeam().getName() : '';
    const singledoubleWill = poulePlace.getTeam() !== undefined ? 'worden' : 'wordt';
    this.setAlert('info', 'een pouleplek' + competitor + ' ' + singledoubleWill + ' verwijderd');
    try {
      this.moveCompetitors(rootRound, poulePlace);
      this.getStructureService().removePoulePlace(rootRound);
      const singledoubleIs = poulePlace.getTeam() !== undefined ? 'zijn' : 'is';
      this.saveStructure('een pouleplek' + competitor + ' ' + singledoubleIs + ' verwijderd');
    } catch (e) {
      this.processing = false;
      this.setAlert('danger', e.message);
    }
  }

  /**
   * haal alle pouleplekken op in verticale volgorde, verplaatst alles vanaf te verwijderen plek
   */
  protected moveCompetitors(rootRound: Round, fromPoulePlace: PoulePlace) {
    const poulePlaces: PoulePlace[] = rootRound.getPoulePlaces(Round.ORDER_NUMBER_POULE);
    const index = poulePlaces.indexOf(fromPoulePlace);
    if (index < 0) {
      return;
    }
    if ((index + 1) < poulePlaces.length) {
      const poulePlacesToChange: PoulePlace[] = poulePlaces.splice(index);
      let previousPoulePlace = fromPoulePlace;
      poulePlacesToChange.forEach(poulePlace => {
        previousPoulePlace.setTeam(poulePlace.getTeam());
        previousPoulePlace = poulePlace;
      });
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
