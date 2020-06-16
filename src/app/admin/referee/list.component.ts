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
    this.router.navigate(['/admin/referee', this.tournament.getId(), referee ? referee.getPriority() : '']);
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

  upgradePriority(referee: Referee) {
    this.processing = true;
    this.refereeRepository.upgradeObject(referee, this.tournament)
      .subscribe(
            /* happy path */() => this.updatePlanning(),
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
      );
  }

  removeReferee(referee: Referee) {
    this.processing = true;
    this.refereeRepository.removeObject(referee, this.tournament)
      .subscribe(
            /* happy path */ refereeRes => this.updatePlanning(),
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
      );
  }

  protected updatePlanning() {
    this.planningRepository.create(this.structure, this.tournament, 1).subscribe(
            /* happy path */ roundNumberOut => {
        // this.processing = false;
      },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => this.processing = false
    );
  }
}
