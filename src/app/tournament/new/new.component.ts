import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {
  Association,
  Competition,
  Field,
  JsonStructure,
  League,
  PlanningRepository,
  PlanningService,
  Season,
  SportConfig,
  Structure,
  StructureMapper,
  StructureRepository,
  StructureService,
} from 'ngx-sport';

import { AuthService } from '../../auth/auth.service';
import { IAlert } from '../../common/alert';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';


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
    private structureRepository: StructureRepository,
    private planningRepository: PlanningRepository,
    private structureMapper: StructureMapper,
    fb: FormBuilder
  ) {
    const date = new Date();
    this.minDateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };

    this.sportnames = SportConfig.getSports().sort();

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

  create(): boolean {

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
      tournament.setPublic(true);
    }

    this.tournamentRepository.createObject(tournament)
      .subscribe(
        /* happy path */ tournamentOut => {
          const structureService = new StructureService({ min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS });
          const structure: Structure = structureService.create(tournamentOut.getCompetition(), nrofcompetitors);
          const jsonStructure: JsonStructure = this.structureMapper.toJson(structure);
          this.structureRepository.createObject(jsonStructure, tournamentOut.getCompetition())
            .subscribe(
            /* happy path */(structureOut: Structure) => {
                const planningService = new PlanningService(tournamentOut.getCompetition());
                const tournamentService = new TournamentService(tournamentOut);
                tournamentService.create(planningService, structureOut.getFirstRoundNumber());
                this.planningRepository.createObject(structureOut.getFirstRoundNumber())
                  .subscribe(
                    /* happy path */ games => {
                      this.router.navigate(['/toernooi', tournamentOut.getId()]);
                    },
                  /* error path */ e => {
                      this.setAlert('danger', 'de toernooi-planning kon niet worden aangemaakt: ' + e);
                      this.processing = false;
                    },
                  /* onComplete */() => { this.processing = false; }
                  );
              },
            /* error path */ e => {
                this.setAlert('danger', 'de toernooi-indeling kon niet worden aangemaakt: ' + e);
                this.processing = false;
              }
            );
        },
            /* error path */ e => { this.setAlert('danger', 'het toernooi kon niet worden aangemaakt: ' + e); this.processing = false; }
      );
    return false;
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert(): void {
    this.alert = undefined;
  }

  getStructureDescription() {

    const nrOfCompetitors = this.customForm.controls.nrofcompetitors.value;
    const structureService = new StructureService({ min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS });
    const defaultNrOfPoules = nrOfCompetitors !== undefined ? structureService.getDefaultNrOfPoules(nrOfCompetitors) : undefined;
    const sPouleDescr = defaultNrOfPoules > 1 ? 'poules' : 'poule';
    return defaultNrOfPoules + ' ' + sPouleDescr;
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  equals(one: NgbDateStruct, two: NgbDateStruct) {
    return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
  }
  isSelected = date => this.equals(date, this.customForm.controls.date.value);

}
