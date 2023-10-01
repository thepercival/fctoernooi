import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { DateFormatter } from '../../lib/dateFormatter';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { TournamentShell } from '../../lib/tournament/shell';
import { TournamentShellFilter, TournamentShellRepository } from '../../lib/tournament/shell/repository';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Role } from '../../lib/role';
import { UserRepository } from '../../lib/user/repository';
import { User } from '../../lib/user';
import { CopyConfig, CopyModalComponent } from '../tournament/copymodal.component';
import { TournamentRepository } from '../../lib/tournament/repository';

@Component({
  selector: 'app-tournament-examples',
  templateUrl: './examples.component.html',
  styleUrls: ['./examples.component.scss']
})
export class ExamplesComponent implements OnInit{

  public processing = true;
  public alert: IAlert | undefined;
  public tournamentShells!: TournamentShell[];

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private tournamentShellRepos: TournamentShellRepository,
    private tournamentRepository: TournamentRepository,
    private userRepository: UserRepository,
    globalEventsManager: GlobalEventsManager
  ) {
    globalEventsManager.showFooter.emit(true);
  }  

  ngOnInit() {

    const filter = { example: true };
    this.tournamentShellRepos.getObjects(filter)
      .subscribe({
        next: (shells: TournamentShell[]) => {
          this.tournamentShells = shells;
          this.processing = false;
        },
        error: (e: string) => {
          this.alert = { type: IAlertType.Danger, message: e };
          this.processing = false;
        }
      });
  }

  linkToView(shell: TournamentShell) {
    this.router.navigate(['/public/structure', shell.tournamentId]);
  } 

  openCopyModal(shell: TournamentShell) {    
    
    this.processing = true;
    this.userRepository.getLoggedInObject()
      .subscribe({
        next: (loggedInUser: User | undefined) => {
          if (loggedInUser === undefined) {
            const navigationExtras: NavigationExtras = {
              queryParams: { type: IAlertType.Danger, message: 'je bent niet ingelogd' }
            };
            this.router.navigate(['', navigationExtras]);
            return;
          }
          
          const nrOfCredits = loggedInUser.getNrOfCredits();
          if (loggedInUser.getValidated() && nrOfCredits === 0) {
            this.router.navigate(['/user/buycredits']);
            return;
          }

          const activeModal = this.modalService.open(CopyModalComponent, { scrollable: false });
          activeModal.componentInstance.name = shell.name;
          activeModal.componentInstance.startDateTime = shell.startDateTime;
          activeModal.componentInstance.showLowCreditsWarning = nrOfCredits === 1;

          activeModal.result.then((result) => {
            this.copy(shell.tournamentId, result);
          }, (reason) => {
          });
          this.processing = false;
        },
        error: (e: string) => { this.alert = this.createAlert( IAlertType.Danger, e); this.processing = false; }
      });
  }

  copy(tournamentId: number, copyConfig: CopyConfig) {
    this.alert = this.createAlert(IAlertType.Info, 'de nieuwe editie wordt aangemaakt');


    this.processing = true;
    this.tournamentRepository.copyObject(tournamentId, copyConfig.startDate)
      .subscribe({
        next: (newTournamentId: number | string) => {
          this.router.navigate(['/admin', newTournamentId]);
          this.alert = this.createAlert(IAlertType.Success, 'de nieuwe editie is aangemaakt, je bevindt je nu in de nieuwe editie');
        },
        error: (e: string) => {
          this.alert = this.createAlert(IAlertType.Danger, 'er kon geen nieuwe editie worden aangemaakt : ' + e);
          this.processing = false;
        },
        complete: () => this.processing = false
      });
  }

  public createAlert(type: IAlertType, message: string): IAlert {
    return { type, message };
  }
}