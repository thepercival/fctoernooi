import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IAlert } from '../app.definitions';
import { AuthService } from '../auth/auth.service';
import { IconManager } from '../common/iconmanager';
import { TournamentRepository, TournamentShell } from '../fctoernooi/tournament/repository';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  // modelFilter: any;
  tournamentShells: TournamentShell[];
  searchShells: TournamentShell[];
  alert: IAlert;
  // isCollapsed = true;
  processing = true;
  borderDate: Date;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private tournamentRepos: TournamentRepository,
    private iconManager: IconManager
  ) {
    this.borderDate = new Date();
    this.borderDate.setDate(this.borderDate.getDate() - 14);
  }

  ngOnInit() {
    this.setTournamentShells();

    this.route.queryParams.subscribe(params => {
      if (params.type !== undefined && params.message !== undefined) {
        this.alert = { type: params['type'], message: params['message'] };
      }
    });
  }

  setTournamentShells() {
    this.processing = true;
    this.tournamentRepos.getShells({ minDate: this.borderDate })
      .subscribe(
          /* happy path */ tournamentShellsRes => {
          this.tournamentShells = tournamentShellsRes.sort((ts1, ts2) => {
            return (ts1.startDateTime < ts2.startDateTime ? 1 : -1);
          });
          this.searchShells = this.tournamentShells;
          this.processing = false;
        },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
        /* onComplete */() => this.processing = false
      );
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  // getDate(dateStruct: NgbDateStruct): Date {
  //   return new Date(
  //     dateStruct.year,
  //     dateStruct.month - 1,
  //     dateStruct.day
  //   );
  // }

  // getDateString(dateStruct: NgbDateStruct) {

  //   const date = this.getDate(dateStruct);

  //   return date ? date.toLocaleString('en', {
  //     month: 'short',
  //     day: '2-digit'
  //   }) : undefined;
  // }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  linkToView(shell: TournamentShell) {
    this.router.navigate(['/toernooi/view', shell.tournamentId]);
  }

  // changeFilterDate(date: NgbDateStruct) {
  //   this.isCollapsed = true;
  //   this.setTournamentShells();
  // }
}
