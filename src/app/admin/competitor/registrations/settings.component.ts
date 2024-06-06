import { Component, Input, ModelSignal, OnInit, TemplateRef, input, model, output } from '@angular/core';
import { Router } from '@angular/router';
import { IAlert } from '../../../shared/common/alert';
import { JsonRegistrationSettings } from '../../../lib/tournament/registration/settings/json';
import { FormControl, FormGroup, ValueChangeEvent } from '@angular/forms';
import { TournamentRegistrationSettings } from '../../../lib/tournament/registration/settings';
import { Tournament } from '../../../lib/tournament';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TournamentRegistrationRepository } from '../../../lib/tournament/registration/repository';
import { DateConverter } from '../../../lib/dateConverter';
import { InfoModalComponent } from '../../../shared/tournament/infomodal/infomodal.component';
import { DateFormatter } from '../../../lib/dateFormatter';

@Component({
  selector: 'app-tournament-registrations-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class RegistrationSettingsComponent implements OnInit{
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
        
  public processing = false;

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
  }

  openHelpModal(modalContent: TemplateRef<any>) {
    const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
    activeModal.componentInstance.header = 'inschrijven tot';
    activeModal.componentInstance.modalContent = modalContent;
    activeModal.componentInstance.noHeaderBorder = true;
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
    this.processing = true;
    this.registrationRepository.editSettings(this.formToJson(currentSettings), this.tournament())
      .subscribe({
        next: (settings: TournamentRegistrationSettings) => {
          this.settings.set(settings);          
          // this.router.navigate(['/admin', newTournamentId]);
          // this.setAlert(IAlertType.Success, 'het delen is gewijzigd');
        },
        error: (e) => {
          // this.setAlert(IAlertType.Danger, 'het delen kon niet worden gewijzigd');
          this.processing = false;
        },
        complete: () => this.processing = false
      }); 

    return true;
  }

  // protected setAlert(type: IAlertType, message: string) {
  //   this.alert = { 'type': type, 'message': message };
  // }

  // protected resetAlert(): void {
  //   this.alert = undefined;
  // }
}