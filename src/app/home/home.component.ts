import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../lib/auth/auth.service';
import { IAlert, IAlertType } from '../shared/common/alert';
import { TournamentShellRepository } from '../lib/tournament/shell/repository';
import { Role } from '../lib/role';
import { TournamentShell } from '../lib/tournament/shell';
import { GlobalEventsManager } from '../shared/common/eventmanager';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  static readonly START_HOUR_IN_PAST = 4;

  shellsTillX: TournamentShell[] = [];
  shellsFromX: TournamentShell[] = [];
  shellsX = 5;
  linethroughDate: Date;
  showingAllWithRole = false;

  alert: IAlert | undefined;
  processing = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private tournamentShellRepos: TournamentShellRepository,
    globalEventsManager: GlobalEventsManager
  ) {
    this.linethroughDate = new Date();
    this.linethroughDate.setHours(this.linethroughDate.getHours() - HomeComponent.START_HOUR_IN_PAST);
    globalEventsManager.showFooter.emit(true);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params.type !== undefined && params.message !== undefined) {
        this.alert = { type: params['type'], message: params['message'] };
      }
    });
  }

  ngAfterViewInit() {
    this.setShellsWithRole();
  }



  setShellsWithRole() {
    this.shellsTillX = [];
    this.shellsFromX = [];

    if (!this.authService.isLoggedIn()) {
      this.processing = false;
      return;
    }

    const filter = { roles: Role.All };
    this.tournamentShellRepos.getObjects(filter)
      .subscribe({
        next: (myShells) => {
          this.sortShellsByDateDesc(myShells);
          let myShell: TournamentShell | undefined;
          while (myShell = myShells.shift()) {
            if (this.shellsTillX.length < this.shellsX) {
              this.shellsTillX.push(myShell);
            } else {
              this.shellsFromX.push(myShell);
            }
          }
          this.processing = false;
          this.authService.extendToken();
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        },
        complete: () => this.processing = false
      });
  }

  protected sortShellsByDateDesc(shells: TournamentShell[]) {
    shells.sort((ts1, ts2) => {
      return (ts1.startDateTime < ts2.startDateTime ? 1 : -1);
    });
  }

  protected setAlert(type: IAlertType, message: string) {
    this.alert = { 'type': type, 'message': message };
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

  linkToTournament(shell: TournamentShell) {
    this.processing = true;
    const module = shell.roles > 0 && shell.roles !== Role.Referee ? '/admin' : '/public';
    this.router.navigate([module, shell.tournamentId]);
  }
}


