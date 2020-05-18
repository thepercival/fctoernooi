import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../lib/auth/auth.service';
import { IAlert } from '../shared/common/alert';
import { TournamentShell, TournamentShellFilter, TournamentShellRepository } from '../lib/tournament/shell/repository';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  static readonly FUTURE: number = 1;
  static readonly PAST: number = 2;

  @ViewChild('inputsearchname') private searchElementRef: ElementRef;

  shellsWithRole: TournamentShell[];
  shellsWithRoleFromFour: TournamentShell[];
  showingAllWithRole = false;
  publicShells: TournamentShell[];
  showingFuture = false;
  alert: IAlert;
  processingWithRole = true;
  publicProcessing = true;
  public firstTimeVisit;
  private defaultHourRange: HourRange = {
    start: -4, end: 168
  };
  private hourRange: HourRange;
  searchFilterActive = false;
  searchForm: FormGroup;
  /* searchFilterName: string; */
  hasSearched = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private tournamentShellRepos: TournamentShellRepository,
    fb: FormBuilder
  ) {
    this.checkFirstTimeVisit();
    this.searchForm = fb.group({
      filterName: ['', Validators.compose([
        Validators.required,
        Validators.minLength(0),
        Validators.maxLength(20)
      ])],
    });
    this.onSearchChanges();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params.type !== undefined && params.message !== undefined) {
        this.alert = { type: params['type'], message: params['message'] };
      }
    });
  }

  ngAfterViewInit() {
    // this.disableSearchFilter();
    // this.setShellsWithRole();
  }

  onSearchChanges(): void {
    this.searchForm.get('filterName').valueChanges.subscribe(val => {
      this.changeSearchFilterName(val);
    });
  }

  setShellsWithRole() {
    this.shellsWithRole = [];
    this.shellsWithRoleFromFour = [];

    if (!this.authService.isLoggedIn()) {
      this.processingWithRole = false;
      return;
    }

    const filter = { mine: true };
    this.tournamentShellRepos.getObjects(filter)
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
          this.authService.extendToken();
        },
          /* error path */ e => { this.setAlert('danger', e); this.processingWithRole = false; },
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

  checkFirstTimeVisit() {
    if (localStorage.getItem('firsttimevisit') === null) {
      this.firstTimeVisit = true;
      localStorage.setItem('firsttimevisit', JSON.stringify(false));
    } else {
      this.firstTimeVisit = false;
    }
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  linkToNew() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/new']);
    } else {
      this.router.navigate(['/public/prenew']);
    }
  }

  linkToView(shell: TournamentShell) {
    this.publicProcessing = true;
    this.router.navigate(['/public', shell.tournamentId]);
  }

  linkToEdit(shell: TournamentShell) {
    this.processingWithRole = true;
    this.router.navigate(['/admin', shell.tournamentId]);
  }

  enableSearchFilter() {
    this.searchFilterActive = true;
    setTimeout(() => { // this will make the execution after the above boolean has changed
      this.searchElementRef.nativeElement.scrollIntoView(true);
      this.searchElementRef.nativeElement.focus();
    }, 0);
    this.publicShells = [];
  }


  disableSearchFilter() {
    this.searchFilterActive = false;
    this.publicShells = [];
    this.hourRange = { start: this.defaultHourRange.start, end: this.defaultHourRange.start };
    this.searchForm.controls.filterName.setValue(undefined);
    this.addToPublicShells(HomeComponent.FUTURE, this.defaultHourRange.end - this.defaultHourRange.start);
  }

  expandPastDays() {
    const pastHoursToAdd = this.hourRange.start === this.defaultHourRange.start
      ? this.defaultHourRange.start + this.defaultHourRange.end : -this.hourRange.start;
    this.addToPublicShells(HomeComponent.PAST, pastHoursToAdd);
  }

  expandFutureDays() {
    this.addToPublicShells(HomeComponent.FUTURE, this.hourRange.end);
  }

  private extendHourRange(pastFuture: number, hoursToAdd: number): TournamentShellFilter {
    const startDate = new Date(), endDate = new Date();
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
    if (searchFilterName === undefined || searchFilterName.length < 2) {
      return;
    }
    this.publicProcessing = true;
    const searchFilter = this.getSearchFilter(undefined, undefined, searchFilterName);
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
