import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IAlert } from '../app.definitions';
import { AuthService } from '../auth/auth.service';
import { IconManager } from '../common/iconmanager';
import { TournamentRepository, TournamentShell, TournamentShellFilter } from '../fctoernooi/tournament/repository';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewChecked {
  tournamentShells: TournamentShell[];
  searchShells: TournamentShell[];
  showingFuture = false;
  alert: IAlert;
  processing = true;
  pastDate: Date;
  pastDays = 14;
  futureDate: Date;
  searchFilter: TournamentShellFilter;
  processingSearch = false;
  hasSearched = false;
  scrollToId;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private tournamentRepos: TournamentRepository,
    private scrollService: ScrollToService,
    public iconManager: IconManager
  ) {
    this.pastDate = new Date();
    this.pastDate.setDate(this.pastDate.getDate() - this.pastDays);
    this.futureDate = new Date();
    this.futureDate.setDate(this.futureDate.getDate() + 30);
    this.searchFilter = { maxDate: this.pastDate, name: undefined };
  }

  ngOnInit() {
    this.setTournamentShells(this.futureDate);

    this.route.queryParams.subscribe(params => {
      if (params.type !== undefined && params.message !== undefined) {
        this.alert = { type: params['type'], message: params['message'] };
      }
      if (params.scrollToId !== undefined) {
        this.scrollToId = params.scrollToId;
      }
    });
  }

  ngAfterViewChecked() {
    // if (this.tournamentShells !== undefined && this.processing === false && this.scrollToId !== undefined) {
    //   console.log('scrolling');
    //   this.scrollService.scrollTo({
    //     target: 'scroll-' + this.scrollToId,
    //     duration: 100
    //   });
    //   this.scrollToId = undefined;
    // }
  }

  setTournamentShells(futureDate) {
    this.processing = true;
    this.tournamentShells = [];

    this.tournamentRepos.getShells({ minDate: this.pastDate, maxDate: futureDate })
      .subscribe(
          /* happy path */ tournamentShellsRes => {
          this.tournamentShells = tournamentShellsRes;
          if (this.authService.isLoggedIn()) {
            this.tournamentRepos.getShells({ withRoles: true })
              .subscribe(
                /* happy path */ myTournamentShellsRes => {
                  myTournamentShellsRes.forEach(myShell => {
                    if (this.tournamentShells.find(tournamentShell => tournamentShell.tournamentId === myShell.tournamentId)
                      === undefined) {
                      this.tournamentShells.push(myShell);
                    }
                  });
                  this.tournamentShells = tournamentShellsRes.sort((ts1, ts2) => {
                    return (ts1.startDateTime < ts2.startDateTime ? 1 : -1);
                  });
                },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                /* onComplete */() => { this.processing = false; this.showingFuture = (futureDate === undefined); }
              );
          } else {
            this.tournamentShells = tournamentShellsRes.sort((ts1, ts2) => {
              return (ts1.startDateTime < ts2.startDateTime ? 1 : -1);
            });
            this.showingFuture = (futureDate === undefined);
            this.processing = false;
          }
        },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
      );
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  linkToView(shell: TournamentShell) {
    this.processing = true;
    this.router.navigate(['/toernooi/view', shell.tournamentId]);
  }

  showFuture() {
    this.setTournamentShells(undefined);
  }

  getFutureTextRowspan(xs: boolean) {
    const rowSpan = this.isLoggedIn() ? 4 : 3;
    return xs ? rowSpan - 1 : rowSpan;
  }

  searchOlderShells() {
    this.processingSearch = true;
    this.hasSearched = true;
    this.tournamentRepos.getShells(this.searchFilter)
      .subscribe(
          /* happy path */ tournamentShellsRes => {
          this.searchShells = tournamentShellsRes.sort((ts1, ts2) => {
            return (ts1.startDateTime < ts2.startDateTime ? 1 : -1);
          });
        },
        /* error path */ e => { this.setAlert('danger', e); this.processingSearch = false; },
        /* onComplete */() => this.processingSearch = false
      );
  }
}
