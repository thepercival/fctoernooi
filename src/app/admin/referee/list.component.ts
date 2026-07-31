import { Component, inject, OnInit, signal, TemplateRef, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Referee } from 'ngx-sport';

import { IAlert, IAlertType } from '../../shared/common/alert';
import { RefereeRepository } from '../../lib/ngx-sport/referee/repository';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TournamentNavBarComponent } from '../../shared/tournament/tournamentNavBar/tournamentNavBar.component';
import { faEnvelope, faInfoCircle, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { facReferee } from '../../shared/customicons';
import { INFO_MODAL_INPUTS } from '../../shared/modal-input-interfaces/info-modal-inputs.interface';
import { createModalInjector } from '../../shared/modal-input-interfaces/create-modal-injector';

@Component({
    selector: 'app-tournament-referee',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgbAlert,FontAwesomeModule,TournamentNavBarComponent]
})
export class RefereeListComponent extends TournamentComponent implements OnInit {
  private refereeRepository = inject(RefereeRepository);
  private planningRepository = inject(PlanningRepository);

  faSpinner = faSpinner;
  faEnvelope = faEnvelope;
  faInfoCircle = faInfoCircle;
  facReferee = facReferee;
  public readonly refereeItems: WritableSignal<RefereeItem[]> = signal([]);
  alertSelfReferee: IAlert | undefined;
  hasBegun: boolean = true;

  modalService: NgbModal = inject(NgbModal);
  validations: any = {
    'minlengthname': Referee.MIN_LENGTH_NAME,
    'maxlengthname': Referee.MAX_LENGTH_NAME
  };
  faPlus = faPlus;
  constructor() {
    const route = inject(ActivatedRoute);
    const router = inject(Router);
    const tournamentRepository = inject(TournamentRepository);
    const sructureRepository = inject(StructureRepository);
    const globalEventsManager = inject(GlobalEventsManager);

    super(route, router, tournamentRepository, sructureRepository, globalEventsManager);
  }

  ngOnInit() {
    super.myNgOnInit(() => this.initReferees());
  }

  initReferees() {
    this.updateRefereesList();

    this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();
    if (this.hasBegun) {
      this.alert.set({ type: IAlertType.Warning, message: 'er zijn al wedstrijden gespeeld, je kunt niet meer toevoegen en verwijderen' });
    }
    this.processing.set(false);
  }

  updateRefereesList() {
    const refereeItems = this.competition.getReferees().map((referee: Referee): RefereeItem => {
      return { referee };
    });
    refereeItems.forEach((refereeItem: RefereeItem, index: number) => {
      this.refereeRepository.getRoleState(refereeItem.referee, this.tournament)
        .subscribe((roleState: number) => {
          this.refereeItems.update((items: RefereeItem[]) => {
            if (items[index] === undefined || items[index].referee !== refereeItem.referee) {
              return items;
            }
            const updated = [...items];
            updated[index] = { ...updated[index], rolState: roleState };
            return updated;
          });
        });
    });
    this.refereeItems.set(refereeItems);
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
    const modalInjector = createModalInjector(this.injector, INFO_MODAL_INPUTS, {
      header: 'uitleg scheidsrechters',
      modalContent,
      noHeaderBorder: true
    });
    const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal', injector: modalInjector });
    activeModal.result.then((result) => {
      this.linkToPlanningConfig();
    }, (reason) => { });
  }

  upgradePriority(referee: Referee) {
    this.processing.set(true);
    this.refereeRepository.upgradeObject(referee, this.tournament)
      .subscribe({
        next: () => {
          this.updateRefereesList()
          this.updatePlanning()
        },
        error: (e) => {
          this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
        }
      });
  }

  removeReferee(referee: Referee) {
    this.processing.set(true);
    this.alert.set(undefined);
    this.refereeRepository.removeObject(referee, this.tournament)
      .subscribe({
        next: () => {
          this.updateRefereesList(); // this.removeRefereeFromList(referee);
          this.updatePlanning()
        },
        error: (e) => {
          this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
        }
      });
  }

  // removeRefereeFromList(referee: Referee) {
  //   this.refereeItems.update((items: RefereeItem[]) => items.filter((item: RefereeItem) => item.referee !== referee));
  // }

  protected updatePlanning() {
    this.planningRepository.create(this.structure, this.tournament)
      .subscribe({
        next: () => { },
        error: (e) => {
          this.alert.set({ type: IAlertType.Danger, message: e }); this.processing.set(false);
        },
        complete: () => this.processing.set(false)
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