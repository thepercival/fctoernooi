import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { TournamentRepository } from '../fctoernooi/tournament/repository';
import { Tournament } from '../fctoernooi/tournament';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  tournaments: Tournament[];
  deleteAlert = null;

  constructor(
      private route: ActivatedRoute,
      private authService: AuthService,
      private tournamentRepos: TournamentRepository
  ) {
    console.log("construct start HomeComponent");
    console.log("construct end HomeComponent");
  }

  ngOnInit() {
    this.tournamentRepos.getObjects().forEach( tournaments => this.tournaments = tournaments);

    this.route.queryParams.subscribe(params => {
      console.log(params['deletealert']);
      this.deleteAlert = params['deletealert'];
    });
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
