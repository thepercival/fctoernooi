import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {
  Association,
  Competition,
  Field,
  League,
  RankingService,
  Season,
  Sport,
  SportConfigService,
  SportScoreConfigService,
  Structure,
  StructureMapper,
  StructureService,
} from 'ngx-sport';

import { AuthService } from '../../lib/auth/auth.service';
import { IAlert } from '../../shared/common/alert';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TranslateService } from '../../lib/translate';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';


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
    maxnroffields: Tournament.StructureOptions.placeRange.max / 2,
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
    const nrofcompetitors = 5;
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
          const structureService = new StructureService(Tournament.StructureOptions);
          const structure: Structure = structureService.create(tournamentOut.getCompetition(), nrofcompetitors);
          this.structureRepository.editObject(structure, tournamentOut)
            .subscribe(
            /* happy path */(structureOut: Structure) => {
                this.planningRepository.create(structureOut.getFirstRoundNumber(), tournamentOut)
                  .subscribe(
                    /* happy path */ roundNumberOut => {
                      this.router.navigate(['/admin/structure', tournamentOut.getId()]);
                    },
                  /* error path */ e => {
                      this.setAlert('danger', 'de toernooi-planning kon niet worden aangemaakt: ' + e);
                      this.processing = false;
                    },
                  /* onComplete */() => { this.processing = false; }
                  );
              },
            /* error path */ e => {
                this.setAlert('danger', 'de opzet kon niet worden aangemaakt: ' + e);
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

  getFieldsDescription(): string {
    const translate = new TranslateService();
    return translate.getFieldNamePlural(this.sport);
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  equals(one: NgbDateStruct, two: NgbDateStruct) {
    return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
  }
  isSelected = date => this.equals(date, this.form.controls.date.value);

}