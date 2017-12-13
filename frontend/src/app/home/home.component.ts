import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';

import { IAlert } from '../app.definitions';
import { AuthService } from '../auth/auth.service';
import { Tournament } from '../fctoernooi/tournament';
import { TournamentRepository } from '../fctoernooi/tournament/repository';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  modelFilter: any;
  tournaments: Tournament[];
  alert: IAlert = null;
  isCollapsed = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private tournamentRepos: TournamentRepository
  ) {
    this.initFilterFields();
  }

  ngOnInit() {
    this.tournamentRepos.getObjects().forEach(tournaments => this.tournaments = tournaments);

    this.route.queryParams.subscribe(params => {
      if (params['type'] != null && params['message'] != null) {
        this.alert = { type: params['type'], message: params['message'] };
      }
    });
  }

  initFilterFields() {
    const date = new Date();
    this.modelFilter = {
      date: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() },
      mine: false
    };
  }

  getDateString(dateStruct: NgbDateStruct) {

    const date = new Date(
      this.modelFilter.date.year,
      this.modelFilter.date.month - 1,
      this.modelFilter.date.day
    );

    return date ? date.toLocaleString('en', {
      month: 'short',
      day: '2-digit'
    }) : null;
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  hasPermission(tournament: Tournament) {
    const loggedInUserId = this.authService.getLoggedInUserId();
    return tournament.getRoles().reduce(function (hasPermission, roleIt) {
      if (hasPermission) {
        return hasPermission;
      }
      return loggedInUserId === roleIt.getUser().getId();
    }, false);
  }

  linkToView(tournament: Tournament) {
    console.log('/toernooi/' + tournament.getId());
    this.router.navigate(['/toernooi', tournament.getId()]);
  }
}
