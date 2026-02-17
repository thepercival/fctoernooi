import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap/types/alert';
import {
  NgbCollapse,
  NgbDatepicker,
  NgbDatepickerContent,
  NgbDatepickerMonth,
  NgbInputDatepicker,
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavItemRole,
  NgbNavLink,
  NgbNavLinkBase,
  NgbNavLinkButton,
  NgbNavOutlet,
  NgbNavPane,
  NgbPopover,
  NgbProgressbar,
  NgbTimepicker,
} from '@ng-bootstrap/ng-bootstrap';

export const TOURNAMENT_UI_IMPORTS = [
  CommonModule,
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
];
