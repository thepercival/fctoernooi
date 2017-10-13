import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { TournamentRepository } from '../fctoernooi/tournament/repository';
import { Tournament } from '../fctoernooi/tournament';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  tournaments: Tournament[];

  constructor( private authService: AuthService, private tournamentRepos: TournamentRepository ) { }

  ngOnInit() {
    this.tournamentRepos.getObjects().forEach( tournaments => this.tournaments = tournaments);
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  hasPermission(tournament: Tournament) {
    const loggedInUserId = this.authService.getLoggedInUserId();
    return tournament.getRoles().reduce(function(hasPermission, roleIt) {
        if ( hasPermission ) {
          return hasPermission;
        }
        return loggedInUserId === roleIt.getUser().getId() ;
      }, false );
  }

}
