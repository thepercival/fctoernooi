import { Component, OnInit, WritableSignal, input, model, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentCompetitor } from '../../../lib/competitor';
import { IAlert } from '../../../shared/common/alert';
import { JsonRegistrationSettings } from '../../../lib/tournament/registration/settings/json';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TournamentRegistrationSettings } from '../../../lib/tournament/registration/settings';
import { Tournament } from '../../../lib/tournament';
import { TournamentRegistrationRepository } from '../../../lib/tournament/registration/repository';
import { DateConverter } from '../../../lib/dateConverter';
import { TournamentRegistrationSettingsMapper } from '../../../lib/tournament/registration/settings/mapper';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { faEye, faPrint, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-tournament-registrations-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgbAlert, FontAwesomeModule, RouterLink, ReactiveFormsModule]
})
export class RegistrationFormComponent implements OnInit{
  faSpinner = faSpinner;
  faEye = faEye;
  faPrint = faPrint;
  public tournament = input.required<Tournament>();
  public settings = model.required<TournamentRegistrationSettings>();
  
  public alert: IAlert | undefined;
  public typedForm!: FormGroup<{
    remark: FormControl<string>
  }>;
        
  public readonly processing: WritableSignal<boolean> = signal(true);

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
      remark: new FormControl(this.settings().getRemark(), { nonNullable: true })
    });    
    this.typedForm = form;
    this.processing.set(false);
  }


  formToJson(): JsonRegistrationSettings {
    const json = this.settingsMapper.toJson(this.settings());
    json.remark = this.typedForm.controls.remark.value;
    return json;
  }

  save(): boolean {
    this.processing.set(true);
    this.registrationRepository.editSettings(this.formToJson(), this.tournament())
      .subscribe({
        next: (settings: TournamentRegistrationSettings) => {
          this.settings.set(settings);
          // this.router.navigate(['/admin', newTournamentId]);
          // this.setAlert(IAlertType.Success, 'het delen is gewijzigd');
        },
        error: (e) => {
          // this.setAlert(IAlertType.Danger, 'het delen kon niet worden gewijzigd');
          this.processing.set(false);
        },
        complete: () => this.processing.set(false)
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