import { Component, Input, ModelSignal, OnDestroy, OnInit, TemplateRef, WritableSignal, input, model, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IAlert, IAlertType } from '../../../shared/common/alert';
import { JsonRegistrationSettings } from '../../../lib/tournament/registration/settings/json';
import { FormControl, FormGroup, ReactiveFormsModule, ValueChangeEvent } from '@angular/forms';
import { TournamentRegistrationSettings } from '../../../lib/tournament/registration/settings';
import { Tournament } from '../../../lib/tournament';
import { NgbAlert, NgbDateStruct, NgbInputDatepicker, NgbModal, NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { TournamentRegistrationRepository } from '../../../lib/tournament/registration/repository';
import { DateConverter } from '../../../lib/dateConverter';
import { InfoModalComponent } from '../../../shared/tournament/infomodal/infomodal.component';
import { DateFormatter } from '../../../lib/dateFormatter';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendarDays, faCircleInfo, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tournament-registrations-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, NgbAlert, FontAwesomeModule, NgbTimepicker, NgbInputDatepicker]
})
export class RegistrationSettingsComponent implements OnInit, OnDestroy {
  faSpinner = faSpinner;
  faInfoCircle = faCircleInfo;
  faCalendarAlt = faCalendarDays;
  public tournament = input.required<Tournament>();
  public settings = model.required<TournamentRegistrationSettings>();

  public maxDateStruct!: NgbDateStruct;
  public alert: IAlert | undefined;
  public typedForm!: FormGroup<{
    enabled: FormControl<boolean>,
    endDate: FormControl<string>,
    endTime: FormControl<string>,
    mailAlert: FormControl<boolean>
  }>;
        
  public readonly processing: WritableSignal<boolean> = signal(true);
  public readonly saving: WritableSignal<boolean> = signal(false);
  public saveAlert: IAlert | undefined;
  private saveAlertTimeoutId: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private registrationRepository: TournamentRegistrationRepository,
    public dateFormatter: DateFormatter,
    private dateConverter: DateConverter) {
  }

  ngOnInit(): void {

    const settings = this.settings();
    if (settings === undefined) {
      this.processing.set(false);
      return;
    }

    const maxDate = this.tournament().getCompetition().getStartDateTime();
    this.maxDateStruct = { year: maxDate.getFullYear(), month: maxDate.getMonth() + 1, day: maxDate.getDate() };

    
    const form = new FormGroup<{
      enabled: FormControl<boolean>,
      endDate: FormControl<string>,
      endTime: FormControl<string>,
      mailAlert: FormControl<boolean>
    }>({
      enabled: new FormControl(settings.isEnabled(), { nonNullable: true }),
      endDate: new FormControl('', { nonNullable: true }),
      endTime: new FormControl('', { nonNullable: true }),
      mailAlert: new FormControl(settings.hasMailAlert(), { nonNullable: true })
    });
    
    this.dateConverter.setDateTime(form.controls.endDate, form.controls.endTime, settings.getEnd());
    this.typedForm = form;

    form.controls.enabled.events.subscribe(event => {
      if( event instanceof ValueChangeEvent) {
        this.onChangeEnabled();
      }
    });

    this.onChangeEnabled();
    this.processing.set(false);
  }

  ngOnDestroy(): void {
    this.clearSaveAlertTimer();
  }

  openHelpModal(modalContent: TemplateRef<any>) {
    const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
    activeModal.componentInstance.header = () => 'inschrijven tot';
    activeModal.componentInstance.modalContent = () => modalContent;
    activeModal.componentInstance.noHeaderBorder = () => true;
    activeModal.result.then((result) => {      
      this.router.navigate(['/admin/startandrecesses', this.tournament().getId()]);
    }, (reason) => { });
  }
  
  onChangeEnabled(): void {
    if (this.typedForm.controls.enabled.value) {
      this.typedForm.controls.endDate.enable({ onlySelf: true });
      this.typedForm.controls.endTime.enable({ onlySelf: true });
      this.typedForm.controls.mailAlert.enable({ onlySelf: true });      
    } else {
      this.typedForm.controls.endDate.disable({ onlySelf: true });
      this.typedForm.controls.endTime.disable({ onlySelf: true });
      this.typedForm.controls.mailAlert.disable({ onlySelf: true });
    }
  }

  formToJson(settings: TournamentRegistrationSettings): JsonRegistrationSettings {
    return {
      id: settings.getId(),
      enabled: this.typedForm.controls.enabled.value,
      end: this.dateConverter.getDateTime(this.typedForm.controls.endDate, this.typedForm.controls.endTime).toISOString(),
      mailAlert: this.typedForm.controls.mailAlert.value,
      remark: settings.getRemark()
    };
  }

  save(): boolean {
    const currentSettings = this.settings();
    if (currentSettings === undefined) {
      return false;
    }
    this.alert = undefined;
    this.clearSaveAlertTimer();
    this.saveAlert = { type: IAlertType.Info, message: 'opslaan bezig...' };
    this.saving.set(true);
    this.registrationRepository.editSettings(this.formToJson(currentSettings), this.tournament())
      .subscribe({
        next: (settings: TournamentRegistrationSettings) => {
          this.settings.set(settings);
          this.typedForm.markAsPristine();
          this.saveAlert = { type: IAlertType.Success, message: 'instellingen opgeslagen' };
          this.saving.set(false);
          this.saveAlertTimeoutId = setTimeout(() => {
            this.saveAlert = undefined;
            this.saveAlertTimeoutId = undefined;
          }, 3000);
        },
        error: (e) => {
          this.saveAlert = undefined;
          this.alert = { type: IAlertType.Danger, message: 'opslaan mislukt: ' + e };
          this.saving.set(false);
        },
        complete: () => {}
      }); 

    return true;
  }

  private clearSaveAlertTimer(): void {
    if (this.saveAlertTimeoutId !== undefined) {
      clearTimeout(this.saveAlertTimeoutId);
      this.saveAlertTimeoutId = undefined;
    }
  }

  // protected setAlert(type: IAlertType, message: string) {
  //   this.alert = { 'type': type, 'message': message };
  // }

  // protected resetAlert(): void {
  //   this.alert = undefined;
  // }
}