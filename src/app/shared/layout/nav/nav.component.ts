import { Component, Input, OnInit } from '@angular/core';

import { AuthService } from '../../../lib/auth/auth.service';
import { GlobalEventsManager } from '../../../shared/common/eventmanager';
import { LiveboardLink } from '../../../lib/liveboard/link';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  @Input() title: string = 'FCToernooi';
  navbarCollapsed = true;
  tournamentLiveboardLink: LiveboardLink = {};

  constructor(
    public authService: AuthService,
    private globalEventsManager: GlobalEventsManager
  ) {
    this.globalEventsManager.toggleLiveboardIconInNavBar.subscribe((tournamentLiveboardLink: LiveboardLink) => {
      this.tournamentLiveboardLink = tournamentLiveboardLink;
    });
    this.globalEventsManager.updateTitleInNavBar.subscribe((title: string) => {
      this.title = title;
    });
  }
}
