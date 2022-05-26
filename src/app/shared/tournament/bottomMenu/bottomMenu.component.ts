import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../lib/auth/auth.service';
import { Tournament } from '../../../lib/tournament';

@Component({
  selector: 'app-bottom-menu',
  templateUrl: './bottomMenu.component.html',
  styleUrls: ['./bottomMenu.component.scss']
})
export class BottomMenuComponent implements OnInit {

  @Input() tournament!: Tournament;

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {

  }

  ngOnInit() {
  }

  linkToStructure() {
    // if (this.hasRole)
    this.router.navigate(['/admin/structure', this.tournament.getId()]);
  }

  hasRole(roles: number): boolean {
    const loggedInUserId = this.authService.getLoggedInUserId();
    const tournamentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
    return tournamentUser ? tournamentUser.hasARole(roles) : false;
  }
}
