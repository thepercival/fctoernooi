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
  hasBegun: boolean;

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
    this.hasBegun = this.structure.getRootRound().hasBegun();
    if (this.hasBegun) {
      this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer toevoegen en verwijderen');
    }
    this.processing = false;
  }

  createRefereesList() {
    this.referees = this.tournament.getCompetition().getReferees();
  }

  addReferee() {
    this.linkToEdit();
  }

  editReferee(referee: Referee) {
    this.linkToEdit(referee);
  }

  linkToEdit(referee?: Referee) {
    this.router.navigate(['/toernooi/refereeedit', this.tournament.getId(), referee ? referee.getInitials() : '']);
  }

  removeReferee(referee: Referee) {
    this.setAlert('info', 'de scheidsrechter wordt verwijderd');
    this.processing = true;

    this.refereeRepository.removeObject(referee, this.tournament.getCompetition())
      .subscribe(
            /* happy path */ refereeRes => {
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
