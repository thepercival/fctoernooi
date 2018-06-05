import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import {
  Association,
  Competition,
  Field,
  League,
  PlanningRepository,
  PlanningService,
  RoundRepository,
  Season,
  SportConfig,
  StructureRepository,
  StructureService,
} from 'ngx-sport';

import { IAlert } from '../../../app.definitions';
import { AuthService } from '../../../auth/auth.service';
import { Tournament } from '../../tournament';
import { TournamentRepository } from '../repository';


@Component({
  selector: 'app-tournament-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class TournamentNewComponent implements OnInit {
  customForm: FormGroup;
  processing = true;
  alert: IAlert;
  minDateStruct: NgbDateStruct;
  sportnames: string[];
  validations: any = {
    minnroffields: 0,
    maxnroffields: Tournament.MAXNROFCOMPETITORS / 2,
    minnrofcompetitors: Tournament.MINNROFCOMPETITORS,
    maxnrofcompetitors: Tournament.MAXNROFCOMPETITORS,
    minlengthname: League.MIN_LENGTH_NAME,
    maxlengthname: League.MAX_LENGTH_NAME,
    maxlengthsportname: League.MAX_LENGTH_SPORT
  };
  // message: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private tournamentRepository: TournamentRepository,
    private roundRepository: RoundRepository,
    private structureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    fb: FormBuilder
  ) {
    const date = new Date();
    this.minDateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };

    this.sportnames = SportConfig.getSports();

    this.customForm = fb.group({
      name: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.validations.minlengthname),
        Validators.maxLength(this.validations.maxlengthname)
      ])],
      sportName: ['', Validators.compose([
        Validators.required
      ])],
      sportNameOther: ['', Validators.compose([
        Validators.minLength(0),
        Validators.maxLength(this.validations.maxlengthsportname)
      ])],
      nrofcompetitors: ['', Validators.compose([
        Validators.required,
        Validators.min(this.validations.minnrofcompetitors),
        Validators.max(this.validations.maxnrofcompetitors)
      ])],
      nroffields: ['', Validators.compose([
        Validators.required,
        Validators.min(0),
        Validators.max(this.validations.maxnroffields)
      ])],
      date: ['', Validators.compose([
      ])],
      time: ['', Validators.compose([
      ])]
    });
  }

  ngOnInit() {
    const date = new Date();
    if (date.getHours() < 23) {
      const nrOfMinutesTillQuarter = date.getMinutes() % 15;
      date.setTime(date.getTime() + ((15 + (15 - nrOfMinutesTillQuarter)) * 60 * 1000));
    }
    this.customForm.controls.date.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
    this.customForm.controls.time.setValue({ hour: date.getHours(), minute: date.getMinutes() });
    this.customForm.controls.nrofcompetitors.setValue(5);
    this.customForm.controls.nroffields.setValue(1);
    this.processing = false;
  }

  create() {

    this.processing = true;
    this.setAlert('info', 'het toernooi wordt aangemaakt');

    const name = this.customForm.controls.name.value;
    let sportName = this.customForm.controls.sportName.value;
    if (sportName === '-1') {
      sportName = this.customForm.controls.sportNameOther.value;
    }
    const nrofcompetitors = this.customForm.controls.nrofcompetitors.value;
    const nroffields = this.customForm.controls.nroffields.value;

    const startDateTime = new Date(
      this.customForm.controls.date.value.year,
      this.customForm.controls.date.value.month - 1,
      this.customForm.controls.date.value.day,
      this.customForm.controls.time.value.hour,
      this.customForm.controls.time.value.minute
    );

    let tournament;
    {
      const association = new Association('username'); // dummy
      const league = new League(name);
      league.setAssociation(association);
      league.setSport(sportName);
      const season = new Season('123'); // dummy
      season.setStartDateTime(new Date());
      season.setEndDateTime(new Date());
      const competition = new Competition(league, season);
      competition.setStartDateTime(startDateTime);
      for (let fieldNumber = 1; fieldNumber <= nroffields; fieldNumber++) {
        const field = new Field(competition, fieldNumber);
        field.setName(String(fieldNumber));
      }
      tournament = new Tournament(competition);
    }

    this.tournamentRepository.createObject(tournament)
      .subscribe(
        /* happy path */ tournamentOut => {
          // setTimeout(3000);
          let structureService = new StructureService(
            tournamentOut.getCompetition(),
            { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS },
            undefined, nrofcompetitors
          );
          const jsonRound = this.roundRepository.objectToJsonHelper(structureService.getFirstRound());
          this.structureRepository.createObject(jsonRound, tournamentOut.getCompetition())
            .subscribe(
            /* happy path */ firstRound => {
                structureService = new StructureService(
                  tournamentOut.getCompetition(),
                  { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS },
                  firstRound
                );
                const planningService = new PlanningService(structureService);
                planningService.create(structureService.getFirstRound().getNumber());
                this.planningRepository.createObject([structureService.getFirstRound()])
                  .subscribe(
                    /* happy path */ games => {
                      this.router.navigate(['/toernooi', tournamentOut.getId()]);
                    },
                  /* error path */ e => {
                      this.setAlert('danger', 'de toernooi-planning kon niet worden aangemaakt: ' + e);
                      this.processing = false;
                    }
                  );
              },
            /* error path */ e => {
                this.setAlert('danger', 'de toernooi-structuur kon niet worden aangemaakt: ' + e);
                this.processing = false;
              }
            );
        },
            /* error path */ e => { this.setAlert('danger', 'het toernooi kon niet worden aangemaakt: ' + e); this.processing = false; }
      );
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  equals(one: NgbDateStruct, two: NgbDateStruct) {
    return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
  }
  isSelected = date => this.equals(date, this.customForm.controls.date.value);

}
