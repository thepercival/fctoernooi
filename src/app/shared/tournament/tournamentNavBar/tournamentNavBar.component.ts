import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../lib/auth/auth.service';
import { Role } from '../../../lib/role';
import { Tournament } from '../../../lib/tournament';
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
    private router: Router,
  ) {

  }

  ngOnInit() {

  }

  get HomeScreen(): TournamentScreen { return TournamentScreen.Home }
  get StructureScreen(): TournamentScreen { return TournamentScreen.Structure }
  get GamesScreen(): TournamentScreen { return TournamentScreen.Games }
  get RankingScreen(): TournamentScreen { return TournamentScreen.Ranking }
  get FavoritesScreen(): TournamentScreen { return TournamentScreen.Favorites }
  get CompetitorsScreen(): TournamentScreen { return TournamentScreen.Competitors }
  get CompetitionSportsScreen(): TournamentScreen { return TournamentScreen.CompetitionSports }

  getTextColorClass(screen: TournamentScreen): string {
    return this.currentScreen !== screen ? 'btn-outline-success border-0' : 'text-secondary';
  }

  linkToHome() {
    this.router.navigate(['/' + (this.public ? 'public' : 'admin'), this.tournament.getId()]);
  }

  linkToStructure() {
    this.router.navigate(['/' + (this.public ? 'public' : 'admin') + '/structure', this.tournament.getId()]);
  }

  linkToGames() {
    this.router.navigate(['/' + (this.public ? 'public' : 'admin') + '/games', this.tournament.getId()]);
  }

  hasRole(roles: number): boolean {
    const loggedInUserId = this.authService.getLoggedInUserId();
    const tournamentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
    return tournamentUser ? tournamentUser.hasARole(roles) : false;
  }
}
