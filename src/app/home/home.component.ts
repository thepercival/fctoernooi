import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { IAlert } from '../common/alert';
import { TournamentShell, TournamentShellFilter, TournamentShellRepository } from '../lib/tournament/shell/repository';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  static readonly FUTURE: number = 1;
  static readonly PAST: number = 2;

  shellsWithRole: TournamentShell[];
  shellsWithRoleFromFour: TournamentShell[];
  showingAllWithRole = false;
  publicShells: TournamentShell[];
  showingFuture = false;
  alert: IAlert;
  processingWithRole = true;
  publicProcessing = true;
  private defaultHourRange: HourRange = {
    start: -4, end: 168
  };
  private hourRange: HourRange;
  searchFilterActive = false;
  searchFilterName: string;
  hasSearched = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private tournamentShellRepos: TournamentShellRepository
  ) {
  }

  ngOnInit() {
    this.disableSearchFilter();
    this.setShellsWithRole();

    this.route.queryParams.subscribe(params => {
      if (params.type !== undefined && params.message !== undefined) {
        this.alert = { type: params['type'], message: params['message'] };
      }
    });
  }

  setShellsWithRole() {
    this.shellsWithRole = [];
    this.shellsWithRoleFromFour = [];

    if (!this.authService.isLoggedIn()) {
      this.processingWithRole = false;
      return;
    }

    this.authService.validateToken().subscribe(
        /* happy path */ res => {
        this.tournamentShellRepos.getObjectsWithRoles()
          .subscribe(
              /* happy path */ myShells => {
              this.sortShellsByDateDesc(myShells);
              while (myShells.length > 0) {
                if (this.shellsWithRole.length < 3) {
                  this.shellsWithRole.push(myShells.shift());
                } else {
                  this.shellsWithRoleFromFour.push(myShells.shift());
                }
              }
              this.processingWithRole = false;
            },
              /* error path */ e => { this.setAlert('danger', e); this.processingWithRole = false; },
              /* onComplete */() => { this.processingWithRole = false; }
          );
      },
        /* error path */ e => {
        this.authService.logout();
        this.setAlert('danger', 'de sessie is verlopen, log opnieuw in');
        this.processingWithRole = false;
      },
        /* onComplete */() => { this.processingWithRole = false; }
    );
  }

  addToPublicShells(pastFuture: number, hoursToAdd: number) {
    this.publicProcessing = true;
    const searchFilter = this.extendHourRange(pastFuture, hoursToAdd);
    this.tournamentShellRepos.getObjects(searchFilter)
      .subscribe(
          /* happy path */(shellsRes: TournamentShell[]) => {
          this.sortShellsByDateAsc(shellsRes);
          if (pastFuture === HomeComponent.PAST) {
            this.publicShells = shellsRes.concat(this.publicShells);
          } else if (pastFuture === HomeComponent.FUTURE) {
            this.publicShells = this.publicShells.concat(shellsRes);
          }
          // this.showingFuture = (futureDate === undefined);
          this.publicProcessing = false;
        },
        /* error path */ e => { this.setAlert('danger', e); this.publicProcessing = false; }
      );
  }

  protected sortShellsByDateAsc(shells: TournamentShell[]) {
    shells.sort((ts1, ts2) => {
      return (ts1.startDateTime > ts2.startDateTime ? 1 : -1);
    });
  }

  protected sortShellsByDateDesc(shells: TournamentShell[]) {
    shells.sort((ts1, ts2) => {
      return (ts1.startDateTime < ts2.startDateTime ? 1 : -1);
    });
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  linkToView(shell: TournamentShell) {
    this.publicProcessing = true;
    this.router.navigate(['/toernooi/view', shell.tournamentId]);
  }

  linkToEdit(shell: TournamentShell) {
    this.processingWithRole = true;
    this.router.navigate(['/toernooi', shell.tournamentId]);
  }

  enableSearchFilter() {
    this.searchFilterActive = true;
    this.publicShells = [];
  }

  disableSearchFilter() {
    this.searchFilterActive = false;
    this.publicShells = [];
    this.hourRange = { start: this.defaultHourRange.start, end: this.defaultHourRange.start };
    this.addToPublicShells(HomeComponent.FUTURE, this.defaultHourRange.end - this.defaultHourRange.start);
  }

  expandPastDays() {
    const pastHoursToAdd = this.hourRange.start === this.defaultHourRange.start ? this.defaultHourRange.start + this.defaultHourRange.end : -this.hourRange.start;
    this.addToPublicShells(HomeComponent.PAST, pastHoursToAdd);
  }

  expandFutureDays() {
    this.addToPublicShells(HomeComponent.FUTURE, this.hourRange.end);
  }

  private extendHourRange(pastFuture: number, hoursToAdd: number): TournamentShellFilter {
    let startDate = new Date(), endDate = new Date();
    if (pastFuture === HomeComponent.PAST) {
      endDate.setHours(endDate.getHours() + this.hourRange.start);
      this.hourRange.start -= hoursToAdd;
      startDate.setHours(startDate.getHours() + this.hourRange.start);
    } else if (pastFuture === HomeComponent.FUTURE) {
      startDate.setHours(startDate.getHours() + this.hourRange.end);
      this.hourRange.end += hoursToAdd;
      endDate.setHours(endDate.getHours() + this.hourRange.end);
    }
    return this.getSearchFilter(startDate, endDate, undefined);
  }

  private getSearchFilter(startDate: Date, endDate: Date, name: string): TournamentShellFilter {
    return { startDate: startDate, endDate: endDate, name: name };
  }

  changeSearchFilterName(searchFilterName: string) {
    this.searchFilterName = searchFilterName;
    if (this.searchFilterName === undefined || this.searchFilterName.length < 2) {
      return;
    }
    this.publicProcessing = true;
    const searchFilter = this.getSearchFilter(undefined, undefined, this.searchFilterName);
    this.tournamentShellRepos.getObjects(searchFilter)
      .subscribe(
        /* happy path */(shellsRes: TournamentShell[]) => {
          this.publicShells = shellsRes;
          this.publicProcessing = false;
        },
      /* error path */ e => { this.setAlert('danger', e); this.publicProcessing = false; }
      );
  }
}

interface HourRange {
  start: number;
  end: number;
}
