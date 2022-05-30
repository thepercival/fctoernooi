import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Referee } from 'ngx-sport';

import { IAlert, IAlertType } from '../../shared/common/alert';
import { RefereeRepository } from '../../lib/ngx-sport/referee/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { Observable } from 'rxjs';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FavoritesRepository } from '../../lib/favorites/repository';

@Component({
  selector: 'app-tournament-referee',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class RefereeListComponent extends TournamentComponent implements OnInit {
  public refereeItems!: RefereeItem[];
  alertSelfReferee: IAlert | undefined;
  hasBegun: boolean = true;

  validations: any = {
    'minlengthname': Referee.MIN_LENGTH_NAME,
    'maxlengthname': Referee.MAX_LENGTH_NAME
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,
    modalService: NgbModal,
    favRepository: FavoritesRepository,
    private refereeRepository: RefereeRepository,
    private planningRepository: PlanningRepository,
  ) {
    super(route, router, tournamentRepository, sructureRepository, globalEventsManager, modalService, favRepository);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initReferees());
  }

  initReferees() {
    this.createRefereesList();

    this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
    if (this.hasBegun) {
      this.setAlert(IAlertType.Warning, 'er zijn al wedstrijden gespeeld, je kunt niet meer toevoegen en verwijderen');
    }
    this.processing = false;
  }

  createRefereesList() {
    this.refereeItems = this.competition.getReferees().map((referee: Referee): RefereeItem => {
      return { referee };
    });
    this.refereeItems.forEach((refereeItem: RefereeItem) => {

      this.refereeRepository.getRoleState(refereeItem.referee, this.tournament)
        .subscribe((roleState: number) => refereeItem.rolState = roleState);
    });
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

  linkToPlanningConfig() {
    this.router.navigate(['/admin/planningconfig', this.tournament.getId(),
      this.structure.getFirstRoundNumber().getNumber()
    ]);
  }

  getRoleStateClass(refereeItem: RefereeItem): string {
    if (refereeItem.rolState === RoleState.hasInvitation) {
      return 'text-warning'
    } else if (refereeItem.rolState === RoleState.hasRole) {
      return 'text-success'
    }
    return '';
  }

  openHelpModal(modalContent: TemplateRef<any>) {
    const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
    activeModal.componentInstance.header = 'uitleg scheidsrechters';
    activeModal.componentInstance.modalContent = modalContent;
    activeModal.componentInstance.noHeaderBorder = true;
    activeModal.result.then((result) => {
      this.linkToPlanningConfig();
    }, (reason) => { });
  }

  upgradePriority(referee: Referee) {
    this.processing = true;
    this.refereeRepository.upgradeObject(referee, this.tournament)
      .subscribe({
        next: () => {
          this.updatePlanning()
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        }
      });
  }

  removeReferee(referee: Referee) {
    this.processing = true;
    this.resetAlert();
    this.refereeRepository.removeObject(referee, this.tournament)
      .subscribe({
        next: () => {
          this.removeRefereeFromList(referee);
          this.updatePlanning()
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        }
      });
  }

  removeRefereeFromList(referee: Referee) {
    const refereeItem = this.refereeItems.find(refereeItem => refereeItem.referee === referee);
    if (refereeItem) {
      const idx = this.refereeItems.indexOf(refereeItem);
      if (idx >= 0) {
        this.refereeItems.splice(idx, 1);
      }
    }
  }

  protected updatePlanning() {
    this.planningRepository.create(this.structure, this.tournament, 1)
      .subscribe({
        next: () => { },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        },
        complete: () => this.processing = false
      });
  }
}

export interface RefereeItem {
  referee: Referee;
  rolState?: RoleState;
}

enum RoleState {
  hasInvitation = 1, hasRole
}