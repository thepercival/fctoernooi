import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';

import { IAlert } from '../app.definitions';
import { AuthService } from '../auth/auth.service';
import { IconManager } from '../common/iconmanager';
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
  alert: IAlert;
  isCollapsed = true;
  processing = true;
  minEndDate: NgbDateStruct;
  maxEndDate: NgbDateStruct;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private tournamentRepos: TournamentRepository,
    private iconManager: IconManager
  ) {
    this.initFilterFields();
  }

  ngOnInit() {
    this.setTournaments();

    this.route.queryParams.subscribe(params => {
      if (params.type !== undefined && params.message !== undefined) {
        this.alert = { type: params['type'], message: params['message'] };
      }
    });
  }

  setTournaments() {
    this.processing = true;
    this.tournamentRepos.getObjects(this.getDate(this.modelFilter.startDate), this.getDate(this.modelFilter.endDate))
      .subscribe(
                        /* happy path */ tournamentsRes => {
          this.tournaments = tournamentsRes.sort((t1, t2) => {
            if (t1.getCompetition().getStartDateTime() < t2.getCompetition().getStartDateTime()) {
              return 1;
            }
            if (t1.getCompetition().getStartDateTime() > t2.getCompetition().getStartDateTime()) {
              return -1;
            }
            return 0;
          });
          this.processing = false;
        },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
        /* onComplete */() => this.processing = false
      );
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  initFilterFields() {

    const startDateTime = new Date();
    startDateTime.setDate(startDateTime.getDate() - 7); // - 2 dagen
    const endDateTime = new Date();
    endDateTime.setDate(endDateTime.getDate() + 184); // + 7 dagen

    this.modelFilter = {
      startDate: { year: startDateTime.getFullYear(), month: startDateTime.getMonth() + 1, day: startDateTime.getDate() },
      endDate: { year: endDateTime.getFullYear(), month: endDateTime.getMonth() + 1, day: endDateTime.getDate() },
      mine: false
    };

    // startDateTime.setDate(startDateTime.getDate() + 1); // + 1 dagen
    // endDateTime.setDate(endDateTime.getDate() + 100); // + 100 dagen

    this.minEndDate = { year: startDateTime.getFullYear(), month: startDateTime.getMonth() + 1, day: startDateTime.getDate() };
    this.maxEndDate = { year: endDateTime.getFullYear(), month: endDateTime.getMonth() + 1, day: endDateTime.getDate() };
  }

  getDate(dateStruct: NgbDateStruct): Date {
    return new Date(
      dateStruct.year,
      dateStruct.month - 1,
      dateStruct.day
    );
  }

  getDateString(dateStruct: NgbDateStruct) {

    const date = this.getDate(dateStruct);

    return date ? date.toLocaleString('en', {
      month: 'short',
      day: '2-digit'
    }) : undefined;
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
    this.router.navigate(['/toernooi/view', tournament.getId()]);
  }

  changeFilterDate(date: NgbDateStruct) {
    this.modelFilter.endDate = date;
    this.isCollapsed = true;
    this.setTournaments();
  }
}
