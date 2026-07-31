import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { faLevelUpAlt, faSignInAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-prenew',
    templateUrl: './prenew.component.html',
    styleUrls: ['./prenew.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FontAwesomeModule, NgbAlert, RouterModule],
})
export class PreNewComponent {
  faLevelUpAlt = faLevelUpAlt;
  faUserCircle = faUserCircle;
  faSignInAlt = faSignInAlt;
  constructor() {
    const globalEventsManager = inject(GlobalEventsManager);

    globalEventsManager.showFooter.emit(true);
  }
}
