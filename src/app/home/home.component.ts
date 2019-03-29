import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';

import { AuthService } from '../auth/auth.service';
import { IAlert } from '../common/alert';
import { TournamentShell, TournamentShellFilter, TournamentShellRepository } from '../lib/tournament/shell/repository';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewChecked {
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
  private defaultPastDays = 0;
  private pastDays: number;
  private defaultFutureDays = 7;
  private futureDays: number;
  searchFilterActive = false;
  searchFilterName: string;
  hasSearched = false;
  scrollToId;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private tournamentShellRepos: TournamentShellRepository,
    private scrollService: ScrollToService
  ) {
    this.pastDays = this.defaultPastDays;
    this.futureDays = this.defaultFutureDays;
  }

  ngOnInit() {

    this.setShellsWithRole();
    this.publicShells = [];
    this.addToPublicShells(HomeComponent.FUTURE, this.defaultFutureDays);

    this.route.queryParams.subscribe(params => {
      if (params.type !== undefined && params.message !== undefined) {
        this.alert = { type: params['type'], message: params['message'] };
      }
      // if (params.scrollToId !== undefined) {
      //   this.scrollToId = params.scrollToId;
      // }
    });
  }

  ngAfterViewChecked() {
    // if (this.tournamentShells !== undefined && this.processing === false && this.scrollToId !== undefined) {
    //   this.scrollService.scrollTo({
    //     target: 'scroll-' + this.scrollToId,
    //     duration: 100
    //   });
    //   this.scrollToId = undefined;
    // }
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

  addToPublicShells(pastFuture: number, daysToAdd: number) {
    this.publicProcessing = true;
    const searchFilter = this.changeDayRange(pastFuture, daysToAdd);
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
    this.pastDays = this.defaultPastDays;
    this.futureDays = this.defaultFutureDays;
    this.addToPublicShells(HomeComponent.FUTURE, this.defaultFutureDays);
  }

  expandPastDays() {
    const pastDays = this.pastDays;
    const newPastDays = this.pastDays === 0 ? this.defaultFutureDays : pastDays * 2;
    this.addToPublicShells(HomeComponent.PAST, newPastDays - pastDays);
  }

  expandFutureDays() {
    const futureDays = this.futureDays;
    const newFutureDays = futureDays * 2;
    this.addToPublicShells(HomeComponent.FUTURE, newFutureDays - futureDays);
  }


  private changeDayRange(pastFuture: number, daysToAdd: number): TournamentShellFilter {
    let startDate = new Date(), endDate = new Date();
    if (pastFuture === HomeComponent.PAST) {
      endDate.setDate(endDate.getDate() - this.pastDays);
      this.pastDays += daysToAdd;
      startDate.setDate(startDate.getDate() - this.pastDays);
    } else if (pastFuture === HomeComponent.FUTURE) {
      startDate.setDate(startDate.getDate() + this.futureDays);
      this.futureDays += daysToAdd;
      endDate.setDate(endDate.getDate() + this.futureDays);
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
