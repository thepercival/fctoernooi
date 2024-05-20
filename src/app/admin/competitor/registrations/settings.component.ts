import { Component, Input, OnInit, output } from '@angular/core';
import { Router } from '@angular/router';
import { IAlert } from '../../../shared/common/alert';
import { JsonRegistrationSettings } from '../../../lib/tournament/registration/settings/json';
import { FormControl, FormGroup } from '@angular/forms';
import { TournamentRegistrationSettings } from '../../../lib/tournament/registration/settings';
import { Tournament } from '../../../lib/tournament';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TournamentRegistrationRepository } from '../../../lib/tournament/registration/repository';
import { DateConverter } from '../../../lib/dateConverter';

@Component({
  selector: 'app-tournament-registrations-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class RegistrationSettingsComponent implements OnInit{
  @Input() tournament!: Tournament;
  @Input({ required: true }) settings!: TournamentRegistrationSettings;

  onSettingsUpdate = output<TournamentRegistrationSettings>();

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
      mailAlert: FormControl<boolean>
    }>({
      enabled: new FormControl(this.settings.isEnabled(), { nonNullable: true }),
      endDate: new FormControl('', { nonNullable: true }),
      endTime: new FormControl('', { nonNullable: true }),
      mailAlert: new FormControl(this.settings.hasMailAlert(), { nonNullable: true })
    });
    
    this.dateConverter.setDateTime(form.controls.endDate, form.controls.endTime, this.settings.getEnd());
    this.typedForm = form;
    this.toggleReadOnly();
  }

  
  toggleReadOnly(): void {
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

  formToJson(): JsonRegistrationSettings {
    return {
      id: this.settings.getId(),
      enabled: this.typedForm.controls.enabled.value,
      end: this.dateConverter.getDateTime(this.typedForm.controls.endDate, this.typedForm.controls.endTime).toISOString(),
      mailAlert: this.typedForm.controls.mailAlert.value,
      remark: this.settings.getRemark()
    };
  }

  save(): boolean {
    this.processing = true;
    this.registrationRepository.editSettings(this.formToJson(), this.tournament)
      .subscribe({
        next: (settings: TournamentRegistrationSettings) => {
          this.settings = settings;
          this.onSettingsUpdate.emit(this.settings);
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