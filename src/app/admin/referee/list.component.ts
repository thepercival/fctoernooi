import { Component, inject, OnInit, signal, TemplateRef, WritableSignal } from '@angular/core';
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

@Component({
    selector: 'app-tournament-referee',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    standalone: true,
    imports: [NgbAlert,FontAwesomeModule,TournamentNavBarComponent]
})
export class RefereeListComponent extends TournamentComponent implements OnInit {
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

  constructor(
    route: ActivatedRoute,
    router: Router,
    tournamentRepository: TournamentRepository,
    sructureRepository: StructureRepository,
    globalEventsManager: GlobalEventsManager,    
    private refereeRepository: RefereeRepository,
    private planningRepository: PlanningRepository,
  ) {
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
    const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
      activeModal.componentInstance.header = () => 'uitleg scheidsrechters';
      activeModal.componentInstance.modalContent = () => modalContent;
      activeModal.componentInstance.noHeaderBorder = () => true;
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