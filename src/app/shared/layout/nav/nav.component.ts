import { Component, Input, OnInit } from '@angular/core';

import { AuthService } from '../../../lib/auth/auth.service';
import { GlobalEventsManager } from '../../../shared/common/eventmanager';
import { LiveboardLink } from '../../../lib/liveboard/link';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  public defaultTitle: string = 'FCToernooi';
  @Input() data: NavBarData = this.getDefaultNavBarData();
  navbarCollapsed = true;
  tournamentLiveboardLink: LiveboardLink = {};

  constructor(
    private router: Router,
    public authService: AuthService,
    private globalEventsManager: GlobalEventsManager
  ) {
    this.globalEventsManager.toggleLiveboardIconInNavBar.subscribe((tournamentLiveboardLink: LiveboardLink) => {
      this.tournamentLiveboardLink = tournamentLiveboardLink;
    });
    this.globalEventsManager.updateDataInNavBar.subscribe((data: NavBarData) => {
      this.data = data;
    });
  }

  linkToHome(){
    this.globalEventsManager.updateDataInNavBar.emit(this.getDefaultNavBarData());
    this.router.navigate(['/']);
  }

  getDefaultNavBarData(): NavBarData {
    return { title: this.defaultTitle, logoUrl: undefined };
  }
}

export interface NavBarData {
  title: string;
  logoUrl: string | undefined;
}
