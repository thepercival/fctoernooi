import { Component, OnInit } from '@angular/core';

import { GlobalEventsManager } from '../common/eventmanager';
import { NavBarTournamentLiveboardLink } from '../nav/nav.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  tournamentLiveboardLink: NavBarTournamentLiveboardLink = {};

  constructor(private globalEventsManager: GlobalEventsManager) {
    this.globalEventsManager.toggleLiveboardIconInNavBar.subscribe((tournamentLiveboardLink: NavBarTournamentLiveboardLink) => {
      this.tournamentLiveboardLink = tournamentLiveboardLink;
    });
  }

  ngOnInit() {
  }

}
