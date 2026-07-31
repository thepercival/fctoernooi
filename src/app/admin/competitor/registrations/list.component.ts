import { Component, Injector, Input, OnChanges, inject, output, signal, SimpleChanges, WritableSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgbAlert, NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Category, StartLocationMap, StructureNameService } from 'ngx-sport';
import { Tournament } from '../../../lib/tournament';
import { IAlert, IAlertType } from '../../../shared/common/alert';
import { TournamentCompetitorMapper } from '../../../lib/competitor/mapper';
import { TournamentRegistration } from '../../../lib/tournament/registration';
import { TournamentRegistrationRepository } from '../../../lib/tournament/registration/repository';
import { TournamentRegistrationProcessModalComponent } from './processmodal.component';
import { RegistrationState } from '../../../lib/tournament/registration/state';
import { TournamentRegistrationTextSubject } from '../../../lib/tournament/registration/text';
import { TextEditorModalComponent } from '../../textEditor/texteditormodal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faFileLines, faPencilAlt, faRegistered, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TOURNAMENT_REGISTRATION_PROCESS_MODAL_INPUTS } from '../../../shared/modal-input-interfaces/tournament-registration-process-modal-inputs.interface';
import { TEXT_EDITOR_MODAL_INPUTS } from '../../../shared/modal-input-interfaces/text-editor-modal-inputs.interface';
import { createModalInjector } from '../../../shared/modal-input-interfaces/create-modal-injector';

@Component({
    selector: 'app-tournament-registrations-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    standalone: true,
    imports: [FontAwesomeModule, NgbAlert, NgbDropdown, RouterLink]
})
export class RegistrationListComponent implements OnChanges  {
  private router = inject(Router);
  private tournamentRegistrationRepository = inject(TournamentRegistrationRepository);
  private modalService = inject(NgbModal);
  private competitorMapper = inject(TournamentCompetitorMapper);

  @Input() tournament!: Tournament;
  @Input() category!: Category;
  @Input() showHeader!: boolean;
  @Input() structureNameService!: StructureNameService;
  @Input() activeTab!: number;

  onAlertChange = output<IAlert>();
  onCompetitorsUpdate = output<void>();

  public registrations: TournamentRegistration[] = [];
  private startLocationMap!: StartLocationMap;
  // public alert: IAlert | undefined;
  
  public readonly processing: WritableSignal<boolean> = signal(true);

  faRegistered = faRegistered;
  faTimesCircle = faTimesCircle;
  faFileLines = faFileLines;
  faPencilAlt = faPencilAlt;
  faCheckCircle = faCheckCircle;
  private injector = inject(Injector);
  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.structureNameService !== undefined
      && changes.structureNameService.currentValue !== changes.structureNameService.previousValue
      /*&& changes.structureNameService.firstChange === false*/) {
      // this.updateItems();
      const startLocationMap = this.structureNameService.getStartLocationMap();
      if (startLocationMap) {
        this.startLocationMap = startLocationMap;
        this.updateRegistrations();
      }
    }
  }

  get Created(): RegistrationState { return RegistrationState.Created; } 
  get Accepted(): RegistrationState { return RegistrationState.Accepted; } 
  get Substitute(): RegistrationState { return RegistrationState.Substitute; } 
  get Declined(): RegistrationState { return RegistrationState.Declined; } 

  updateRegistrations(): void {
    this.processing.set(true);
    this.tournamentRegistrationRepository.getObjects(this.category, this.tournament)
      .subscribe({
        next: (registrations: TournamentRegistration[]) => {
          this.registrations = registrations;
          this.processing.set(false);
        },
        error: (e: string) => {
          this.onAlertChange.emit({ type: IAlertType.Danger, message: e });
          this.processing.set(false);
        }
      });
  }
  
  processRegistration(registration: TournamentRegistration): void {

    const modalInjector = createModalInjector(this.injector, TOURNAMENT_REGISTRATION_PROCESS_MODAL_INPUTS, {
      registration,
      tournament: this.tournament
    });
    const activeModal = this.modalService.open(TournamentRegistrationProcessModalComponent, { size: 'sm', injector: modalInjector });

    activeModal.result.then((newState: RegistrationState) => {
      this.updateRegistrations();      
      if( newState === RegistrationState.Accepted) {        
        this.onCompetitorsUpdate.emit();
      }
      // if (newState === RegistrationState.Archived) {
      //   // remove registration from 
      // }
    }, (reason) => {
    });

  }

  showState(state: RegistrationState): boolean {
    return state !== RegistrationState.Created;
  }

  getStateClass(state: RegistrationState): string {
    if (state === RegistrationState.Declined) {
      return 'danger';
    } else if (state === RegistrationState.Substitute) {
      return 'warning';
    }
    return 'success';
  }


  getTextSubjects(): TournamentRegistrationTextSubject[] {
    return [
      TournamentRegistrationTextSubject.Accept,
      TournamentRegistrationTextSubject.AcceptAsSubstitute,
      TournamentRegistrationTextSubject.Decline]
  }

  getTextSubjectDescription(subject: TournamentRegistrationTextSubject): string {
    if (subject === TournamentRegistrationTextSubject.Accept) {
      return 'tekst bevestiging'
    }
    if (subject === TournamentRegistrationTextSubject.AcceptAsSubstitute) {
      return 'tekst als-reserve'
    }
    return 'tekst afwijzing'
  }

  openTextEditorModal(subject: TournamentRegistrationTextSubject): void {
    this.tournamentRegistrationRepository.getText(this.tournament, subject)
      .subscribe({
        next: (text: string) => {
          const modalInjector = createModalInjector(this.injector, TEXT_EDITOR_MODAL_INPUTS, {
            header: this.getTextSubjectDescription(subject),
            tournament: this.tournament,
            subject,
            initialText: text
          });
          const activeModal = this.modalService.open(TextEditorModalComponent, { size: 'xl', injector: modalInjector });

          activeModal.result.then((newText: string) => {
          }, (reason) => {
          });
        }
      });
  }
  
  // protected setAlert(type: IAlertType, message: string) {
  //   this.alert = { 'type': type, 'message': message };
  // }

  // protected resetAlert(): void {
  //   this.alert = undefined;
  // }
}

