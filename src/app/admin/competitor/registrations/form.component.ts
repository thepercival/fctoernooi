import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentCompetitor } from '../../../lib/competitor';
import { CompetitorRepository } from '../../../lib/ngx-sport/competitor/repository';
import { IAlert, IAlertType } from '../../../shared/common/alert';
import { TournamentCompetitorMapper } from '../../../lib/competitor/mapper';
import { JsonRegistrationSettings } from '../../../lib/tournament/registration/settings/json';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { TournamentRegistrationSettings } from '../../../lib/tournament/registration/settings';
import { Tournament } from '../../../lib/tournament';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TournamentRegistrationRepository } from '../../../lib/tournament/registration/repository';
import { DateConverter } from '../../../lib/dateConverter';
import { TournamentRegistrationMapper } from '../../../lib/tournament/registration/mapper';
import { TournamentRegistrationSettingsMapper } from '../../../lib/tournament/registration/settings/mapper';

@Component({
  selector: 'app-tournament-registrations-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class RegistrationFormComponent implements OnInit{
  @Input() tournament!: Tournament;
  @Input({ required: true }) settings!: TournamentRegistrationSettings;

  @Output() settingsUpdate = new EventEmitter<TournamentRegistrationSettings>();

  public alert: IAlert | undefined;
  public typedForm!: FormGroup<{
    remark: FormControl<string>
  }>;
        
  public processing = false;

  public validations: RegisterSettingsValidations = {
    maxlengthremark: TournamentCompetitor.MAX_LENGTH_INFO
  };

  constructor(
    private router: Router,
    private registrationRepository: TournamentRegistrationRepository,
    private settingsMapper: TournamentRegistrationSettingsMapper,
    private dateConverter: DateConverter) {
  }

  ngOnInit(): void {

    const form = new FormGroup<{remark: FormControl<string>}>({
      remark: new FormControl(this.settings.getRemark(), { nonNullable: true })
    });    
    this.typedForm = form;
  }


  formToJson(): JsonRegistrationSettings {
    const json = this.settingsMapper.toJson(this.settings);
    json.remark = this.typedForm.controls.remark.value;
    return json;
  }

  save(): boolean {
    this.processing = true;
    this.registrationRepository.editSettings(this.formToJson(), this.tournament)
      .subscribe({
        next: (settings: TournamentRegistrationSettings) => {
          this.settings = settings;
          this.settingsUpdate.emit(this.settings);
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