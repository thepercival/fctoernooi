import { Component, OnInit } from '@angular/core';

import { LiveboardLink } from '../../../lib/liveboard/link';
import { GlobalEventsManager } from '../../common/eventmanager';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  tournamentLiveboardLink: LiveboardLink = {};

  constructor(private globalEventsManager: GlobalEventsManager) {
    this.globalEventsManager.toggleLiveboardIconInNavBar.subscribe((tournamentLiveboardLink: LiveboardLink) => {
      this.tournamentLiveboardLink = tournamentLiveboardLink;
    });
  }

  ngOnInit() {
  }

}
