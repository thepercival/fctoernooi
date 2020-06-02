import { Component, Input, OnInit } from '@angular/core';

import { AuthService } from '../../../lib/auth/auth.service';
import { GlobalEventsManager } from '../../../shared/common/eventmanager';
import { LiveboardLink } from '../../../lib/liveboard/link';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  @Input()
  title: string;
  navbarCollapsed = true;
  tournamentLiveboardLink: LiveboardLink = {};

  constructor(
    public authService: AuthService,
    private globalEventsManager: GlobalEventsManager
  ) {
    this.globalEventsManager.toggleLiveboardIconInNavBar.subscribe((tournamentLiveboardLink: LiveboardLink) => {
      this.tournamentLiveboardLink = tournamentLiveboardLink;
    });
  }

  ngOnInit() {
  }
}
