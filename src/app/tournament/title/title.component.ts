import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { MyNavigation } from '../../common/navigation';
import { Tournament } from '../../lib/tournament';

@Component({
  selector: 'app-tournament-title',
  templateUrl: './title.component.html'
})
export class TournamentTitleComponent {

  @Input() tournament: Tournament;
  @Input() routerLink: [];

  constructor(private router: Router, private myNavigation: MyNavigation) {
  }

  navigateBack() {
    if (this.routerLink !== undefined) {
      this.router.navigate(this.routerLink);
    } else {
      this.myNavigation.back();
    }
  }
}

