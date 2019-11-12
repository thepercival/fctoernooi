import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {
  Association,
  Competition,
  Field,
  League,
  PlanningRepository,
  RankingService,
  Season,
  Sport,
  SportConfigService,
  SportScoreConfigService,
  Structure,
  StructureMapper,
  StructureRepository,
  StructureService,
} from 'ngx-sport';

import { AuthService } from '../../auth/auth.service';
import { IAlert } from '../../common/alert';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TranslateService } from '../../lib/translate';


@Component({
  selector: 'app-tournament-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent implements OnInit {
  form: FormGroup;
  processing = true;
  alert: IAlert;
  minDateStruct: NgbDateStruct;
  chooseSport = false;
  sport: Sport;
  validations: any = {
    minnroffields: 1,
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

    this.form = fb.group({
      name: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.validations.minlengthname),
        Validators.maxLength(this.validations.maxlengthname)
      ])],
      sportname: [{ value: '', disabled: true }, Validators.compose([
        Validators.required
      ])],
      nrofcompetitors: ['', Validators.compose([
        Validators.required,
        Validators.min(this.validations.minnrofcompetitors),
        Validators.max(this.validations.maxnrofcompetitors)
      ])],
      nroffields: ['', Validators.compose([
        Validators.required,
        Validators.min(this.validations.minnroffields),
        Validators.max(this.validations.maxnroffields)
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
    this.form.controls.nrofcompetitors.setValue(5);
    this.form.controls.nroffields.setValue(1);
    this.form.controls.public.setValue(true);
    this.processing = false;
  }

  onGetSport(sport: Sport) {
    this.form.controls.sportname.setValue(sport.getName());
    this.sport = sport;
    this.chooseSport = false;
  }

  create(): boolean {

    this.processing = true;
    this.setAlert('info', 'het toernooi wordt aangemaakt');

    const name = this.form.controls.name.value;
    const nrofcompetitors = this.form.controls.nrofcompetitors.value;
    const nroffields = this.form.controls.nroffields.value;

    const startDateTime = new Date(
      this.form.controls.date.value.year,
      this.form.controls.date.value.month - 1,
      this.form.controls.date.value.day,
      this.form.controls.time.value.hour,
      this.form.controls.time.value.minute
    );

    let tournament;
    {
      const association = new Association('username'); // dummy
      const league = new League(name);
      league.setAssociation(association);
      const season = new Season('123'); // dummy
      season.setStartDateTime(new Date());
      season.setEndDateTime(new Date());
      const competition = new Competition(league, season);
      competition.setStartDateTime(startDateTime);
      competition.setRuleSet(RankingService.RULESSET_WC);
      const sportConfigService = new SportConfigService(new SportScoreConfigService());
      sportConfigService.createDefault(this.sport, competition);

      for (let fieldNumber = 1; fieldNumber <= nroffields; fieldNumber++) {
        const field = new Field(competition, fieldNumber);
        field.setName(String(fieldNumber));
        field.setSport(this.sport);
      }
      tournament = new Tournament(competition);
      tournament.setPublic(this.form.controls.public.value);
      tournament.setUpdated(true);
    }

    this.tournamentRepository.createObject(tournament)
      .subscribe(
        /* happy path */ tournamentOut => {
          const structureService = new StructureService({ min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS });
          const structure: Structure = structureService.create(tournamentOut.getCompetition(), nrofcompetitors);
          this.structureRepository.editObject(structure, tournamentOut.getCompetition())
            .subscribe(
            /* happy path */(structureOut: Structure) => {
                this.planningRepository.createObject(structureOut, tournamentOut.getBreak())
                  .subscribe(
                    /* happy path */ structureOut2 => {
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
    const nrOfCompetitors = this.form.controls.nrofcompetitors.value;
    if (nrOfCompetitors < Tournament.MINNROFCOMPETITORS || nrOfCompetitors > Tournament.MAXNROFCOMPETITORS) {
      return '';
    }
    const structureService = new StructureService({ min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS });
    const defaultNrOfPoules = nrOfCompetitors !== undefined ? structureService.getDefaultNrOfPoules(nrOfCompetitors) : undefined;
    const sPouleDescr = defaultNrOfPoules > 1 ? 'poules' : 'poule';
    return defaultNrOfPoules + ' ' + sPouleDescr + ' en ';
  }

  getFieldsDescription(): string {
    const translate = new TranslateService();
    return translate.getFieldsName(this.sport);
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  equals(one: NgbDateStruct, two: NgbDateStruct) {
    return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
  }
  isSelected = date => this.equals(date, this.form.controls.date.value);

}
