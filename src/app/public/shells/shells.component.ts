import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DateFormatter } from '../../lib/dateFormatter';
import { TournamentShell } from '../../lib/tournament/shell';
import { TournamentShellFilter, TournamentShellRepository } from '../../lib/tournament/shell/repository';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';

@Component({
  selector: 'app-tournament-public-shells',
  templateUrl: './shells.component.html',
  styleUrls: ['./shells.component.scss']
})
export class PublicShellsComponent {

  static readonly FUTURE: number = 1;
  static readonly PAST: number = 2;

  @ViewChild('inputsearchname') private searchElementRef: ElementRef | undefined;

  public publicShells: TournamentShell[] = [];
  public showingFuture = false;
  public publicProcessing = true;
  public searchFilterActive = false;
  public searchFilterName: string = '';
  public hasSearched = false;
  public alert: IAlert | undefined;

  private defaultHourRange: HourRange = {
    start: -4, end: 168
  };
  private hourRange!: HourRange;
  private linethroughDate: Date;

  constructor(
    private router: Router,
    private tournamentShellRepos: TournamentShellRepository,
    public dateFormatter: DateFormatter,
    globalEventsManager: GlobalEventsManager
  ) {
    this.linethroughDate = new Date();
    this.linethroughDate.setHours(this.linethroughDate.getHours() + this.defaultHourRange.start);
    globalEventsManager.showFooter.emit(true);
  }

  ngAfterViewInit() {
    this.disableSearchFilter();
  }

  disableSearchFilter() {
    this.searchFilterActive = false;
    this.publicShells = [];
    this.hourRange = { start: this.defaultHourRange.start, end: this.defaultHourRange.start };
    // this.searchForm.controls.filterName.setValue(undefined);
    this.addToPublicShells(PublicShellsComponent.FUTURE, this.defaultHourRange.end - this.defaultHourRange.start);
  }

  expandPastDays() {
    const pastHoursToAdd = this.hourRange.start === this.defaultHourRange.start
      ? this.defaultHourRange.start + this.defaultHourRange.end : -this.hourRange.start;
    this.addToPublicShells(PublicShellsComponent.PAST, pastHoursToAdd);
  }

  expandFutureDays() {
    this.addToPublicShells(PublicShellsComponent.FUTURE, this.hourRange.end);
  }

  private extendHourRange(pastFuture: number, hoursToAdd: number): TournamentShellFilter {
    const startDate = new Date(), endDate = new Date();
    if (pastFuture === PublicShellsComponent.PAST) {
      endDate.setHours(endDate.getHours() + this.hourRange.start);
      this.hourRange.start -= hoursToAdd;
      startDate.setHours(startDate.getHours() + this.hourRange.start);
    } else if (pastFuture === PublicShellsComponent.FUTURE) {
      startDate.setHours(startDate.getHours() + this.hourRange.end);
      this.hourRange.end += hoursToAdd;
      endDate.setHours(endDate.getHours() + this.hourRange.end);
    }
    return this.getSearchFilter(startDate, endDate, undefined);
  }

  private getSearchFilter(startDate: Date | undefined, endDate: Date | undefined, name: string | undefined): TournamentShellFilter {
    return { startDate: startDate, endDate: endDate, name: name };
  }

  enableSearchFilter() {
    this.searchFilterActive = true;
    setTimeout(() => { // this will make the execution after the above boolean has changed
      if (this.searchElementRef) {
        this.searchElementRef.nativeElement.scrollIntoView(true);
        this.searchElementRef.nativeElement.focus();
      }
    }, 0);
    this.publicShells = [];
  }

  changeSearchFilterName(searchFilterName: string) {
    if (searchFilterName.length < 2) {
      return;
    }
    this.publicProcessing = true;
    const searchFilter = this.getSearchFilter(undefined, undefined, searchFilterName);
    this.tournamentShellRepos.getObjects(searchFilter)
      .subscribe({
        next: (shellsRes: TournamentShell[]) => {
          this.publicShells = shellsRes;
          this.publicProcessing = false;
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.publicProcessing = false;
        }
      });
  }

  addToPublicShells(pastFuture: number, hoursToAdd: number) {
    this.publicProcessing = true;
    const searchFilter = this.extendHourRange(pastFuture, hoursToAdd);
    this.tournamentShellRepos.getObjects(searchFilter)
      .subscribe({
        next: (shellsRes: TournamentShell[]) => {
          this.sortShellsByDateDesc(shellsRes);
          if (pastFuture === PublicShellsComponent.PAST) {
            this.publicShells = shellsRes.concat(this.publicShells);
          } else if (pastFuture === PublicShellsComponent.FUTURE) {
            this.publicShells = this.publicShells.concat(shellsRes);
          }
          // this.showingFuture = (futureDate === undefined);
          this.publicProcessing = false;
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.publicProcessing = false;
        }
      });
  }

  onSearchChanges(): void {
    if (this.searchElementRef) {
      this.changeSearchFilterName(this.searchElementRef.nativeElement.value);
    }
  }

  protected sortShellsByDateDesc(shells: TournamentShell[]) {
    shells.sort((ts1, ts2) => {
      return (ts1.startDateTime < ts2.startDateTime ? 1 : -1);
    });
  }

  linkToView(shell: TournamentShell) {
    this.publicProcessing = true;
    this.router.navigate(['/public', shell.tournamentId]);
  }

  // linkToTournament(shell: TournamentShell) {
  //   this.processingWithRole = true;
  //   const module = shell.roles > 0 && shell.roles !== Role.Referee ? '/admin' : '/public';
  //   this.router.navigate([module, shell.tournamentId]);
  // }

  protected setAlert(type: IAlertType, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  inPast(date: Date): boolean {
    return this.linethroughDate.getTime() > date.getTime();
  }
}

interface HourRange {
  start: number;
  end: number;
}