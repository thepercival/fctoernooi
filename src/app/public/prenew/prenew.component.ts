import { Component } from '@angular/core';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { faLevelUpAlt, faSignInAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-prenew',
    templateUrl: './prenew.component.html',
    styleUrls: ['./prenew.component.scss'],
  imports: [FontAwesomeModule, NgbAlert, RouterModule],
})
export class PreNewComponent {
  faLevelUpAlt = faLevelUpAlt;
  faUserCircle = faUserCircle;
  faSignInAlt = faSignInAlt;

  constructor(
    globalEventsManager: GlobalEventsManager
  ) {
    globalEventsManager.showFooter.emit(false);
  }
}
