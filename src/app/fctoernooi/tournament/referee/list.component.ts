import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningService, Referee, RefereeRepository, StructureRepository, StructureService } from 'ngx-sport';

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
    private refereeRepository: RefereeRepository
  ) {
    super(route, router, tournamentRepository, sructureRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initReferees());
  }

  initReferees() {
    this.createRefereesList();
    this.setPlanningService();
    this.processing = false;
    if (this.isStarted()) {
      this.setAlert('warning', 'het toernooi is al begonnen, je kunt niet meer wijzigen');
    }
  }

  setPlanningService() {
    this.planningService = new PlanningService(this.structureService);
  }

  isStarted() {
    return this.structureService.getFirstRound().isStarted();
  }

  createRefereesList() {
    this.referees = this.structureService.getCompetitionseason().getReferees();
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
    this.setAlert('info', 'scheidsrechter verwijderen..');
    this.processing = true;

    this.refereeRepository.removeObject(referee)
      .subscribe(
            /* happy path */ refereeRes => {

        const index = this.referees.indexOf(referee);
        if (index > -1) {
          this.referees.splice(index, 1);
        }
        const firstRound = this.structureService.getFirstRound();
        const planningService = new PlanningService(this.structureService);
        planningService.reschedule(firstRound.getNumber());
        this.structureRepository.editObject(firstRound, this.structureService.getCompetitionseason())
          .subscribe(
                /* happy path */ roundRes => {
            this.structureService = new StructureService(
              this.tournament.getCompetitionseason(),
              { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS },
              roundRes
            );
            this.setPlanningService();
            this.processing = false;
            this.setAlert('info', 'scheidsrechter verwijderd');
          },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                /* onComplete */() => this.processing = false
          );
      },
            /* error path */ e => { this.setAlert('danger', 'X' + e); this.processing = false; },
    );
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }


}
