import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Referee } from 'ngx-sport';

import { IAlert } from '../../shared/common/alert';
import { RefereeRepository } from '../../lib/ngx-sport/referee/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, forkJoin } from 'rxjs';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';

@Component({
  selector: 'app-tournament-referee',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class RefereeListComponent extends TournamentComponent implements OnInit {
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
    private modalService: NgbModal,
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
    this.hasBegun = this.structure.getRootRound().hasBegun();
    if (this.hasBegun) {
      this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer toevoegen en verwijderen');
    }
    this.processing = false;
  }

  createRefereesList() {
    this.referees = this.competition.getReferees();
  }

  addReferee() {
    this.linkToEdit();
  }

  editReferee(referee: Referee) {
    this.linkToEdit(referee);
  }

  linkToEdit(referee?: Referee) {
    this.router.navigate(['/admin/referee', this.tournament.getId(), referee ? referee.getRank() : '']);
  }

  openHelpModal(modalContent) {
    const activeModal = this.modalService.open(modalContent);
    activeModal.result.then((result) => {
      if (result === 'linkToPlanningConfig') {
        this.router.navigate(['/admin/planningconfig', this.tournament.getId(), this.structure.getFirstRoundNumber().getNumber()]);
      }
    }, (reason) => {
    });
  }

  upgradeRank(referee: Referee) {
    const downgrade = this.competition.getReferee(referee.getRank() - 1);
    referee.setRank(downgrade.getRank());
    downgrade.setRank(downgrade.getRank() + 1);
    // doe sortering en backend

    this.setAlert('info', 'de belangrijkheid van de scheidsrechters wordt gewijzigd');
    this.processing = true;

    const reposUpdates: Observable<Referee>[] = [
      this.refereeRepository.editObject(referee, this.tournament),
      this.refereeRepository.editObject(downgrade, this.tournament)
    ];
    this.upgradeRankHelper(reposUpdates);
  }

  protected upgradeRankHelper(reposUpdates: Observable<Referee>[]) {
    forkJoin(reposUpdates).subscribe(results => {
      this.referees.sort((refA, refB) => refA.getRank() - refB.getRank());
      const firstRoundNumber = this.structure.getFirstRoundNumber();
      this.planningRepository.createObject(firstRoundNumber, this.tournament).subscribe(
            /* happy path */ roundNumberOut => {
          this.setAlert('success', 'de belangrijkheid van de scheidsrechters is gewijzigd');
        },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
      );
    },
      err => {
        this.setAlert('danger', 'de belangrijkheid van de scheidsrechters is niet gewijzigd: ' + err);
        this.processing = false;
      }
    );
  }

  removeReferee(referee: Referee) {
    this.setAlert('info', 'de scheidsrechter wordt verwijderd');
    this.processing = true;

    this.refereeRepository.removeObject(referee, this.tournament)
      .subscribe(
            /* happy path */ refereeRes => {
          const firstRoundNumber = this.structure.getFirstRoundNumber();
          this.planningRepository.createObject(firstRoundNumber, this.tournament).subscribe(
            /* happy path */ roundNumberOut => {
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
