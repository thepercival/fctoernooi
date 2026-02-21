import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';

export const TOURNAMENT_UI_IMPORTS = [
  FontAwesomeModule,
  ReactiveFormsModule,
  RouterModule,
  /**
   * NgbAlertModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbDatepickerContentModule,
  NgbDatepickerMonthModule,
  NgbInputDatepickerModule,
  NgbNavModule,
  NgbNavContentModule,
  NgbNavItemModule,
  NgbNavItemRoleModule,
  NgbNavLinkModule,
  NgbNavLinkBaseModule,
  NgbNavLinkButtonModule,
  NgbNavOutletModule,
  NgbNavPaneModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbTimepickerModule,
   */
  NgbAlert,
];
