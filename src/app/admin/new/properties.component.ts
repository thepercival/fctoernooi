import { Component, EventEmitter, OnInit, Output, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  @Output() toNextStep = new EventEmitter<JsonTournament>();
  form: FormGroup;
  minDateStruct: NgbDateStruct;
  validations: any = {
    minlengthname: League.MIN_LENGTH_NAME,
    maxlengthname: League.MAX_LENGTH_NAME
  };

  constructor(
    private modalService: NgbModal,
    fb: FormBuilder
  ) {
    const date = new Date();
    this.minDateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };

    this.form = fb.group({
      name: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.validations.minlengthname),
        Validators.maxLength(this.validations.maxlengthname)
      ])],
      date: ['', Validators.compose([
      ])],
      time: ['', Validators.compose([
      ])],
      public: ['', Validators.compose([
      ])]
    });
  }

  ngOnInit() {
    const date = new Date();
    if (date.getHours() < 23) {
      const nrOfMinutesTillQuarter = date.getMinutes() % 15;
      date.setTime(date.getTime() + ((15 + (15 - nrOfMinutesTillQuarter)) * 60 * 1000));
    }
    this.form.controls.date.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
    this.form.controls.time.setValue({ hour: date.getHours(), minute: date.getMinutes() });
    this.form.controls.public.setValue(true);
  }

  save(): boolean {

    const name = this.form.controls.name.value;
    const startDateTime: Date = new Date(
      this.form.controls.date.value.year,
      this.form.controls.date.value.month - 1,
      this.form.controls.date.value.day,
      this.form.controls.time.value.hour,
      this.form.controls.time.value.minute
    );

    const jsonTournament: JsonTournament = {
      id: 0,
      public: this.form.controls.public.value,
      startEditMode: StartEditMode.EditLongTerm, /* @TODO CDK */
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
