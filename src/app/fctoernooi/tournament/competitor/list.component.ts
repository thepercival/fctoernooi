import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoulePlace, PoulePlaceRepository, StructureNameService, StructureRepository, TeamRepository } from 'ngx-sport';
import { Observable ,  forkJoin } from 'rxjs';

import { IAlert } from '../../../app.definitions';
import { Tournament } from '../../tournament';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';

@Component({
  selector: 'app-tournament-competitors',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class CompetitorListComponent extends TournamentComponent implements OnInit {
  poulePlaces: PoulePlace[];
  infoAlert = true;
  alert: IAlert;
  processing = false;
  poulePlaceToSwap: PoulePlace;

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    private teamRepository: TeamRepository,
    private poulePlaceRepository: PoulePlaceRepository,
    public nameService: StructureNameService
  ) {
    super(route, router, tournamentRepository, sructureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initPoulePlaces());
  }

  initPoulePlaces() {
    const round = this.structureService.getFirstRound();
    this.poulePlaces = round.getPoulePlaces();
  }

  isStarted() {
    return this.structureService.getFirstRound().isStarted();
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
    if (this.poulePlaceToSwap === undefined) {
      this.poulePlaceToSwap = poulePlaceToSwap;
      return;
    }
    if (this.poulePlaceToSwap === poulePlaceToSwap) {
      this.poulePlaceToSwap = undefined;
      return;
    }

    const teamTmp = this.poulePlaceToSwap.getTeam();
    this.poulePlaceToSwap.setTeam(poulePlaceToSwap.getTeam());
    poulePlaceToSwap.setTeam(teamTmp);

    const reposUpdates: Observable<PoulePlace>[] = [];
    reposUpdates.push(this.poulePlaceRepository.editObject(this.poulePlaceToSwap, this.poulePlaceToSwap.getPoule()));
    reposUpdates.push(this.poulePlaceRepository.editObject(poulePlaceToSwap, poulePlaceToSwap.getPoule()));

    this.swapHelper(reposUpdates);
  }

  swapAll() {
    const poulePlacesCopy = this.poulePlaces.slice();
    const teams = this.structureService.getFirstRound().getTeams();
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
      this.setAlert('info', 'volgorde teams gewijzigd');
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

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }
}
