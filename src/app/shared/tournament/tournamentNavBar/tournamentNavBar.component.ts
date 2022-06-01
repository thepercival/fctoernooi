import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../lib/auth/auth.service';
import { Role } from '../../../lib/role';
import { Tournament } from '../../../lib/tournament';
import { TranslateService } from '../../../lib/translate';
import { TournamentScreen } from '../screenNames';

@Component({
  selector: 'app-tournament-navbar',
  templateUrl: './tournamentNavBar.component.html',
  styleUrls: ['./tournamentNavBar.component.scss']
})
export class TournamentNavBarComponent implements OnInit {

  @Input() tournament!: Tournament;
  @Input() public: boolean = false;
  @Input() currentScreen!: TournamentScreen;
  @Input() roles!: Role[];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {

  }

  ngOnInit() {

  }

  get StructureScreen(): TournamentScreen { return TournamentScreen.Structure }
  get GamesScreen(): TournamentScreen { return TournamentScreen.Games }
  get RankingScreen(): TournamentScreen { return TournamentScreen.Ranking }
  get FavoritesScreen(): TournamentScreen { return TournamentScreen.Favorites }
  get CompetitorsScreen(): TournamentScreen { return TournamentScreen.Competitors }
  get SettingsScreen(): TournamentScreen { return TournamentScreen.Settings }

  getTextColorClass(screen: TournamentScreen): string {
    return this.currentScreen !== screen ? 'btn-outline-success border-0' : 'text-secondary';
  }

  linkToStructure() {
    this.router.navigate(['/' + (this.public ? 'public' : 'admin') + '/structure', this.tournament.getId()]);
  }

  linkToGames() {
    this.router.navigate(['/' + (this.public ? 'public' : 'admin') + '/games', this.tournament.getId()]);
  }

  linkToRanking() {
    this.router.navigate(['/' + (this.public ? 'public' : 'admin') + '/rannking', this.tournament.getId()]);
  }

  hasRole(roles: number): boolean {
    const loggedInUserId = this.authService.getLoggedInUserId();
    const tournamentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
    return tournamentUser ? tournamentUser.hasARole(roles) : false;
  }

}
