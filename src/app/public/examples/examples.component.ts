import { Component, OnInit, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { TournamentShell } from '../../lib/tournament/shell';
import { TournamentShellRepository } from '../../lib/tournament/shell/repository';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserRepository } from '../../lib/user/repository';
import { User } from '../../lib/user';
import { CopyConfig, CopyModalComponent } from '../tournament/copymodal.component';
import { TournamentRepository } from '../../lib/tournament/repository';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCopy, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-examples',
    templateUrl: './examples.component.html',
    styleUrls: ['./examples.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FontAwesomeModule]
    
})
export class ExamplesComponent implements OnInit{
  faSpinner = faSpinner;
  faCopy = faCopy;

  public readonly processing: WritableSignal<boolean> = signal(true);
  public readonly alert: WritableSignal<IAlert | undefined> = signal(undefined);
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
          this.processing.set(false);
        },
        error: (e: string) => {
          this.alert.set({ type: IAlertType.Danger, message: e });
          this.processing.set(false);
        }
      });
  }

  linkToView(shell: TournamentShell) {
    this.router.navigate(['/public/structure', shell.tournamentId]);
  } 

  openCopyModal(shell: TournamentShell) {    
    
    this.processing.set(true);
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
          this.processing.set(false);
        },
        error: (e: string) => { this.alert.set(this.createAlert( IAlertType.Danger, e)); this.processing.set(false); }
      });
  }

  copy(tournamentId: number, copyConfig: CopyConfig) {
    this.alert.set(this.createAlert(IAlertType.Info, 'de nieuwe editie wordt aangemaakt'));


    this.processing.set(true);
    this.tournamentRepository.copyObject(tournamentId, copyConfig)
      .subscribe({
        next: (newTournamentId: number | string) => {
          this.router.navigate(['/admin', newTournamentId]);
          this.alert.set(this.createAlert(IAlertType.Success, 'de nieuwe editie is aangemaakt, je bevindt je nu in de nieuwe editie'));
        },
        error: (e: string) => {
          this.alert.set(this.createAlert(IAlertType.Danger, 'er kon geen nieuwe editie worden aangemaakt : ' + e));
          this.processing.set(false);
        },
        complete: () => this.processing.set(false)
      });
  }

  public createAlert(type: IAlertType, message: string): IAlert {
    return { type, message };
  }
}