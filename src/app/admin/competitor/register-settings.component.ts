import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentCompetitor } from '../../lib/competitor';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { TournamentCompetitorMapper } from '../../lib/competitor/mapper';
import { JsonRegistrationSettings } from '../../lib/tournament/registration/settings/json';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { TournamentRegistrationSettings } from '../../lib/tournament/registration/settings';
import { Tournament } from '../../lib/tournament';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TournamentRegistrationRepository } from '../../lib/tournament/registration/repository';
import { DateConverter } from '../../lib/dateConverter';

@Component({
  selector: 'app-tournament-register-settings',
  templateUrl: './register-settings.component.html',
  styleUrls: ['./register-settings.component.scss']
})
export class RegistrationSettingsComponent implements OnInit{
  @Input() tournament!: Tournament;
  @Input({ required: true }) registrationSettings!: TournamentRegistrationSettings;

  @Output() registerEnabledUpdate = new EventEmitter<boolean>();

  public maxDateStruct!: NgbDateStruct;
  public alert: IAlert | undefined;
  public typedForm!: FormGroup<{
    enabled: FormControl<boolean>,
    endDate: FormControl<string>,
    endTime: FormControl<string>,
    mailAlert: FormControl<boolean>,
    remark: FormControl<string>
  }>;
        
  public processing = false;

  public validations: RegisterSettingsValidations = {
    maxlengthremark: TournamentCompetitor.MAX_LENGTH_INFO
  };

  constructor(
    private router: Router,
    private registrationRepository: TournamentRegistrationRepository,
    private dateConverter: DateConverter) {
  }

  ngOnInit(): void {

    const maxDate = this.tournament.getCompetition().getStartDateTime();
    this.maxDateStruct = { year: maxDate.getFullYear(), month: maxDate.getMonth() + 1, day: maxDate.getDate() };

    const form = new FormGroup<{
      enabled: FormControl<boolean>,
      endDate: FormControl<string>,
      endTime: FormControl<string>,
      mailAlert: FormControl<boolean>,
      remark: FormControl<string>
    }>({
      enabled: new FormControl(this.registrationSettings.isEnabled(), { nonNullable: true }),
      endDate: new FormControl('', { nonNullable: true }),
      endTime: new FormControl('', { nonNullable: true }),
      mailAlert: new FormControl(this.registrationSettings.hasMailAlert(), { nonNullable: true }),
      remark: new FormControl(this.registrationSettings.getRemark(), { nonNullable: true })
    });
    
    this.dateConverter.setDateTime(form.controls.endDate, form.controls.endTime, this.registrationSettings.getEnd());
    this.typedForm = form;
    this.toggleReadOnly();
  }

  
  toggleReadOnly(): void {
    if (this.typedForm.controls.enabled.value) {
      this.typedForm.controls.endDate.enable({ onlySelf: true });
      this.typedForm.controls.endTime.enable({ onlySelf: true });
      this.typedForm.controls.mailAlert.enable({ onlySelf: true });
      this.typedForm.controls.remark.enable({ onlySelf: true });
    } else {
      this.typedForm.controls.endDate.disable({ onlySelf: true });
      this.typedForm.controls.endTime.disable({ onlySelf: true });
      this.typedForm.controls.mailAlert.disable({ onlySelf: true });
      this.typedForm.controls.remark.disable({ onlySelf: true });
    }
    this.registerEnabledUpdate.emit(this.typedForm.controls.enabled.value);
  }

  formToJson(): JsonRegistrationSettings {
    return {
      id: this.registrationSettings.getId(),
      enabled: this.typedForm.controls.enabled.value,
      end: this.dateConverter.getDateTime(this.typedForm.controls.endDate, this.typedForm.controls.endTime).toISOString(),
      mailAlert: this.typedForm.controls.mailAlert.value,
      remark: this.typedForm.controls.remark.value
    };
  }

  save(): boolean {
    this.processing = true;
    this.registrationRepository.editSettings(this.formToJson(), this.tournament)
      .subscribe({
        next: (settings: TournamentRegistrationSettings) => {
          this.registrationSettings = settings;
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

export interface RegisterSettingsValidations {
  maxlengthremark: number;
}