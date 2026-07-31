import { Component, OnInit, AfterViewInit, signal, WritableSignal, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../lib/auth/auth.service';
import { IAlert, IAlertType } from '../shared/common/alert';
import { TournamentShellRepository } from '../lib/tournament/shell/repository';
import { Role } from '../lib/role';
import { TournamentShell } from '../lib/tournament/shell';
import { GlobalEventsManager } from '../shared/common/eventmanager';
import { DefaultJsonTheme } from '../lib/tournament/theme';
import { HomeShellComponent } from './shell.component';
import { RoleMapper } from '../lib/tournament/authorization/roleMapper';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [HomeShellComponent],
    templateUrl: './home.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./home.component.scss'],
    
})
export class HomeComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  authService = inject(AuthService);
  private tournamentShellRepos = inject(TournamentShellRepository);
  private globalEventsManager = inject(GlobalEventsManager);

  static readonly START_HOUR_IN_PAST = 4;

  shellsTillX: TournamentShell[] = [];
  shellsFromX: TournamentShell[] = [];
  shellsX = 5;
  linethroughDate: Date;
  showingAllWithRole = false;

  alert: IAlert | undefined;
  public readonly processing: WritableSignal<boolean> = signal(true);
  constructor() {
    const globalEventsManager = this.globalEventsManager;

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
      this.processing.set(false);
      return;
    }

    const allRoles = (new RoleMapper()).getAllRolesAsNumber();
    const filter =  { roles: allRoles, example: false };
    this.tournamentShellRepos.getObjects(filter)
      .subscribe({
        next: (myShells) => {
          this.sortShellsByDateDesc(myShells);
          const nextShellsTillX: TournamentShell[] = [];
          const nextShellsFromX: TournamentShell[] = [];
          let myShell: TournamentShell | undefined;
          while (myShell = myShells.shift()) {
            if (nextShellsTillX.length < this.shellsX) {
              nextShellsTillX.push(myShell);
            } else {
              nextShellsFromX.push(myShell);
            }
          }
          this.shellsTillX = nextShellsTillX;
          this.shellsFromX = nextShellsFromX;
          this.processing.set(false);
          this.authService.extendToken();
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing.set(false);
        },
        complete: () => {
          this.processing.set(false);
        }
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

  linkToExamples() {  
    this.globalEventsManager.updateDataInNavBar.emit({
      title: 'FCToernooi',
      atHome: false,
      theme: DefaultJsonTheme
    });
    this.router.navigate(['/public/examples']);
  }

  linkToPublicTournaments() {
    this.globalEventsManager.updateDataInNavBar.emit({
      title: 'FCToernooi',
      atHome: false,
      theme: DefaultJsonTheme
    });
    this.router.navigate(['/public/shells']);
  }

  linkToTournament(shell: TournamentShell) {
    this.processing.set(true);
    const module = shell.roles > 0 && shell.roles !== Role.Referee ? '/admin' : '/public';
    this.router.navigate([module, shell.tournamentId]);
  }
}


