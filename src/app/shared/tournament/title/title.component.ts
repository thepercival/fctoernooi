import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { MyNavigation } from '../../common/navigation';
import { Tournament } from '../../../lib/tournament';

@Component({
  selector: 'app-tournament-title',
  templateUrl: './title.component.html'
})
export class TitleComponent {
  @Input() tournament: Tournament | undefined;
  @Input() admin: boolean = false;

  constructor(private router: Router, private myNavigation: MyNavigation) {
  }

  navigateBack() {
    if (this.admin && this.tournament) {
      this.router.navigate(['/admin', this.tournament.getId()]);
    } else {
      this.myNavigation.back();
    }
  }
}

