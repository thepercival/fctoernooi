import { NavBarTournamentTVViewLink } from '../nav/nav.component';
import { Component, OnInit } from '@angular/core';

import { GlobalEventsManager } from '../common/eventmanager';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  tournamentViewTVLink: NavBarTournamentTVViewLink = {};

  constructor(private globalEventsManager: GlobalEventsManager) {
    this.globalEventsManager.toggleTVIconInNavBar.subscribe((tournamentViewTVLink: NavBarTournamentTVViewLink) => {
      this.tournamentViewTVLink = tournamentViewTVLink;
    });
  }

  ngOnInit() {
  }

}
