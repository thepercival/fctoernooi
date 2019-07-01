import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanningRepository, SportConfig, Sport, RefereeRepository, StructureRepository } from 'ngx-sport';

import { IAlert } from '../../common/alert';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';
import { TournamentComponent } from '../component';

@Component({
  selector: 'app-tournament-sport',
  templateUrl: './list.component.html',
  styles: ['./list.component.scss']
})
export class SportConfigListComponent extends TournamentComponent implements OnInit {
  sportConfigs: SportConfig[];

  validations: any = {
    'minlengthname': Sport.MIN_LENGTH_NAME,
    'maxlengthname': Sport.MAX_LENGTH_NAME
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
    super.myNgOnInit(() => this.initSports());
  }

  initSports() {
    this.createSportConfigsList();
    // this.planningService = new PlanningService(this.tournament.getCompetition());
    this.processing = false;
    // if (this.isStarted()) {
    //   this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
    // }
  }

  isStarted() {
    return this.structure.getRootRound().isStarted();
  }

  createSportConfigsList() {
    this.sportConfigs = this.tournament.getCompetition().getSportConfigs();
  }

  // addSport() {
  //   this.linkToEdit(this.tournament);
  // }

  editSportConfig(sportConfig: SportConfig) {
    this.linkToEdit(this.tournament, sportConfig);
  }

  linkToEdit(tournament: Tournament, sportConfig?: SportConfig) {
    this.router.navigate(['/toernooi/sportconfigedit', tournament.getId(), sportConfig ? sportConfig.getId() : 0]);
  }

  // linkToRoundSettings() {
  //   this.router.navigate(
  //     ['/toernooi/roundssettings', this.tournament.getId(), this.structure.getFirstRoundNumber().getNumber()],
  //     {
  //       queryParams: { category: '3' }
  //     }
  //   );
  // }

  // removeReferee(referee: Referee) {
  //   this.setAlert('info', 'de scheidsrechter wordt verwijderd');
  //   this.processing = true;

  //   this.refereeRepository.removeObject(referee, this.tournament.getCompetition())
  //     .subscribe(
  //           /* happy path */ refereeRes => {
  //         const index = this.referees.indexOf(referee);
  //         if (index > -1) {
  //           this.referees.splice(index, 1);
  //         }
  //         const firstRoundNumber = this.structure.getFirstRoundNumber();
  //         const tournamentService = new TournamentService(this.tournament);
  //         tournamentService.reschedule(this.planningService, firstRoundNumber);
  //         this.planningRepository.editObject(firstRoundNumber).subscribe(
  //           /* happy path */ gamesdRes => {
  //             if (referee.getEmailaddress() === undefined || referee.getEmailaddress().length === 0) {
  //               this.processing = false;
  //               this.setAlert('success', 'de scheidsrechter is verwijderd');
  //             } else {
  //               this.tournamentRepository.syncRefereeRoles(this.tournament).subscribe(
  //                 /* happy path */ allRolesRes => {
  //                   this.processing = false;
  //                   this.setAlert('success', 'de scheidsrechter is verwijderd');
  //                 },
  //                 /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
  //                 /* onComplete */() => this.processing = false
  //               );
  //             }
  //           },
  //           /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
  //           /* onComplete */() => this.processing = false
  //         );
  //       },
  //           /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
  //     );
  // }
}