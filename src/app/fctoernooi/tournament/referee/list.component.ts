import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningRepository, PlanningService, Referee, RefereeRepository, StructureRepository } from 'ngx-sport';

import { IAlert } from '../../../app.definitions';
import { Tournament } from '../../tournament';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';


@Component({
  selector: 'app-tournament-referee',
  templateUrl: './list.component.html',
  styles: ['./list.component.scss']
})
export class RefereeListComponent extends TournamentComponent implements OnInit {
  infoAlert = true;
  private planningService: PlanningService;
  alert: IAlert;
  processing = true;
  referees: Referee[];

  validations: any = {
    'minlengthname': Referee.MIN_LENGTH_NAME,
    'maxlengthname': Referee.MAX_LENGTH_NAME
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    private refereeRepository: RefereeRepository,
    private planningRepository: PlanningRepository
  ) {
    super(route, router, tournamentRepository, sructureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initReferees());
  }

  initReferees() {
    this.createRefereesList();
    this.planningService = new PlanningService(this.structureService);
    this.processing = false;
    if (this.isStarted()) {
      this.setAlert('warning', 'het toernooi is al begonnen, je kunt niet meer wijzigen');
    }
  }

  isStarted() {
    return this.structureService.getFirstRound().isStarted();
  }

  createRefereesList() {
    this.referees = this.structureService.getCompetition().getReferees();
  }

  addReferee() {
    this.linkToEdit(this.tournament);
  }

  editReferee(referee: Referee) {
    this.linkToEdit(this.tournament, referee);
  }

  linkToEdit(tournament: Tournament, referee?: Referee) {
    this.router.navigate(
      ['/toernooi/refereeedit', tournament.getId(), referee ? referee.getId() : 0],
      {
        queryParams: {
          returnAction: '/toernooi/referees',
          returnParam: tournament.getId()
        }
      }
    );
  }

  removeReferee(referee: Referee) {
    this.setAlert('info', 'de scheidsrechter wordt verwijderd');
    this.processing = true;

    this.refereeRepository.removeObject(referee, this.structureService.getCompetition())
      .subscribe(
            /* happy path */ refereeRes => {
          const index = this.referees.indexOf(referee);
          if (index > -1) {
            this.referees.splice(index, 1);
          }
          const firstRound = this.structureService.getFirstRound();
          this.planningService.reschedule(firstRound.getNumber());
          this.planningRepository.editObject([firstRound])
            .subscribe(
                    /* happy path */ gamesdRes => {
                this.processing = false;
                this.setAlert('info', 'scheidsrechter verwijderd');
              },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
            );
        },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    );
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }


}
