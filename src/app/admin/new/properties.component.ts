import { Component, OnInit, output, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NgbDateStruct, NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { JsonTournament } from '../../lib/tournament/json';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { League } from 'ngx-sport';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { StartEditMode } from '../../lib/tournament/startEditMode';


@Component({
  selector: 'app-tournament-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class TournamentPropertiesComponent implements OnInit {
  
  toNextStep = output<JsonTournament>();
  
  public typedForm: FormGroup<{
    name: FormControl<string>,
    date: FormControl<NgbDateStruct>,
    time: FormControl<NgbTimeStruct>,
    public: FormControl<boolean>,
  }>;
  minDateStruct: NgbDateStruct;
  validations: any = {
    minlengthname: League.MIN_LENGTH_NAME,
    maxlengthname: League.MAX_LENGTH_NAME
  };

  constructor(
    private modalService: NgbModal
  ) {
    const date = new Date();
    this.minDateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };

    this.typedForm = new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: 
        [
            Validators.required,
            Validators.minLength(this.validations.minlengthname),
            Validators.maxLength(this.validations.maxlengthname)
        ] 
      }),
      date: new FormControl(this.toDateStruct(date), { nonNullable: true }),
      time: new FormControl(this.toTimeStruct(date), { nonNullable: true }),
      public: new FormControl(true, { nonNullable: true }),
    });

  }

  ngOnInit() {
    const date = this.calculateCurrentDate(); 
    this.typedForm.controls.date.setValue(this.toDateStruct(date));
    this.typedForm.controls.time.setValue(this.toTimeStruct(date));
    this.typedForm.controls.public.setValue(true);
  }

  calculateCurrentDate(): Date {
    const date = new Date();
    if (date.getHours() < 23) {
      const nrOfMinutesTillQuarter = date.getMinutes() % 15;
      date.setTime(date.getTime() + ((15 + (15 - nrOfMinutesTillQuarter)) * 60 * 1000));
    }
    return date;
  }

  toDateStruct(date: Date): NgbDateStruct {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }

  toTimeStruct(date: Date): NgbTimeStruct {
    return { hour: date.getHours(), minute: date.getMinutes(), second: 0 };
  }

  save(): boolean {

    const name = this.typedForm.controls.name.value;
    const startDateTime: Date = new Date(
      this.typedForm.controls.date.value.year,
      this.typedForm.controls.date.value.month - 1,
      this.typedForm.controls.date.value.day,
      this.typedForm.controls.time.value.hour,
      this.typedForm.controls.time.value.minute
    );

    const jsonTournament: JsonTournament = {
      id: 0,
      public: this.typedForm.controls.public.value,
      startEditMode: StartEditMode.EditLongTerm, /* @TODO CDK */
      intro: '',
      logoExtension: undefined,
      location: undefined,
      competition: {
        id: 0,
        league: {
          id: 0,
          name: name,
          association: { id: 0, name: 'username' }
        },
        season: {
          id: 0,
          name: 'dummy',
          start: (new Date()).toISOString(),
          end: (new Date()).toISOString(),
        },
        againstRuleSet: DefaultService.AgainstRuleSet,
        startDateTime: startDateTime.toISOString(),
        referees: [],
        sports: [],
      },
      competitors: [],
      lockerRooms: [],
      recesses: [],
      users: [],
      sponsors: []
    };
    this.toNextStep.emit(jsonTournament);
    return false;
  }


  openInfoModal(header: string, modalContent: TemplateRef<any>) {
    const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
    activeModal.componentInstance.header = header;
    activeModal.componentInstance.modalContent = modalContent;
  }
}
