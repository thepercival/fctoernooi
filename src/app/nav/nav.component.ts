import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { GlobalEventsManager } from '../common/eventmanager';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  @Input()
  title: string;
  navbarCollapsed = true;
  tournamentViewTVLink: NavBarTournamentTVViewLink = {};

  constructor(
    private authService: AuthService,
    private globalEventsManager: GlobalEventsManager
  ) {
    this.globalEventsManager.toggleTVIconInNavBar.subscribe((tournamentViewTVLink: NavBarTournamentTVViewLink) => {
      this.tournamentViewTVLink = tournamentViewTVLink;
    });
  }

  ngOnInit() {
  }

  isLoggedIn() {

    return this.authService.isLoggedIn();
  }

}

export class NavBarTournamentTVViewLink {
  showTVIcon?: boolean;
  tournamentId?: number;
  link?: string;
}
