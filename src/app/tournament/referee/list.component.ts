import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningRepository, PlanningService, Referee, RefereeRepository, StructureRepository } from 'ngx-sport';

import { IAlert } from '../../common/alert';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';
import { TournamentComponent } from '../component';

@Component({
  selector: 'app-tournament-referee',
  templateUrl: './list.component.html',
  styles: ['./list.component.scss']
})
export class RefereeListComponent extends TournamentComponent implements OnInit {
  private planningService: PlanningService;
  referees: Referee[];
  public selfReferee: boolean;
  alertSelfReferee: IAlert;

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
    this.planningService = new PlanningService(this.tournament.getCompetition());
    this.processing = false;
    if (this.isStarted()) {
      this.setAlert('warning', 'het toernooi is al begonnen, je kunt niet meer wijzigen');
    }
    // http://localhost:4200/toernooi/roundssettings/957/1?returnAction=%2Ftoernooi%2Fedit&returnParam=957
  }

  isStarted() {
    return this.structure.getRootRound().isStarted();
  }

  createRefereesList() {
    this.referees = this.tournament.getCompetition().getReferees();
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

  linkToRoundSettings() {
    this.router.navigate(
      ['/toernooi/roundssettings', this.tournament.getId(), this.structure.getFirstRoundNumber().getNumber()],
      {
        queryParams: {
          category: '3',
          returnAction: '/toernooi/edit',
          returnParam: this.tournament.getId()
        }
      }
    );
  }

  removeReferee(referee: Referee) {
    this.setAlert('info', 'de scheidsrechter wordt verwijderd');
    this.processing = true;

    this.refereeRepository.removeObject(referee, this.tournament.getCompetition())
      .subscribe(
            /* happy path */ refereeRes => {
          const index = this.referees.indexOf(referee);
          if (index > -1) {
            this.referees.splice(index, 1);
          }
          const firstRoundNumber = this.structure.getFirstRoundNumber();
          const tournamentService = new TournamentService(this.tournament);
          tournamentService.reschedule(this.planningService, firstRoundNumber);
          this.planningRepository.editObject(firstRoundNumber).subscribe(
            /* happy path */ gamesdRes => {
              if (referee.getEmailaddress() === undefined || referee.getEmailaddress().length === 0) {
                this.processing = false;
                this.setAlert('success', 'de scheidsrechter is verwijderd');
              } else {
                this.tournamentRepository.syncRefereeRoles(this.tournament).subscribe(
                  /* happy path */ allRolesRes => {
                    this.processing = false;
                    this.setAlert('success', 'de scheidsrechter is verwijderd');
                  },
                  /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                  /* onComplete */() => this.processing = false
                );
              }
            },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
          );
        },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
      );
  }
}
