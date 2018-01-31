import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Association,
  Competition,
  Competitionseason,
  Field,
  PlanningService,
  Season,
  SportConfig,
  StructureRepository,
  StructureService,
} from 'ngx-sport';

import { Tournament } from '../../tournament';
import { TournamentRepository } from '../repository';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tournament-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class TournamentNewComponent implements OnInit {

  model: any;
  loading = false;
  error = '';
  sportnames: string[];
  validations: any = {
    'minnrofcompetitors': Tournament.MINNROFCOMPETITORS,
    'maxnrofcompetitors': Tournament.MAXNROFCOMPETITORS,
    'minnroffields': 1,
    'maxnroffields': 16,
    'minlengthname': Competition.MIN_LENGTH_NAME,
    'maxlengthname': Competition.MAX_LENGTH_NAME
  };
  // message: string;

  constructor(
    private router: Router,
    private tournamentRepository: TournamentRepository,
    private structureRepository: StructureRepository) {
    const date = new Date();
    date.setTime(date.getTime() + (60 * 10 * 1000)); // 10 minutes
    this.sportnames = SportConfig.getSports();
    this.model = {
      starttime: { hour: date.getHours(), minute: date.getMinutes() },
      startdate: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() },
      nrofcompetitors: 5,
      nroffields: 1
    };
  }

  ngOnInit() {
  }

  create() {
    if (this.model.nrofcompetitors < 3 || this.model.nrofcompetitors > 64) {
      return;
    }
    this.loading = true;

    const sportName = this.model.sportname !== '-1' ? this.model.sportname : this.model.sportnameother;

    const startdate = new Date(
      this.model.startdate.year,
      this.model.startdate.month - 1,
      this.model.startdate.day,
      this.model.starttime.hour,
      this.model.starttime.minute
    );

    let tournament;
    {
      const association = new Association('username'); // dummy
      const competition = new Competition(this.model.name);
      const season = new Season('123'); // dummy
      season.setStartDateTime(new Date());
      season.setEndDateTime(new Date());
      const competitionseason = new Competitionseason(association, competition, season);
      competitionseason.setSport(sportName);
      competitionseason.setStartDateTime(startdate);
      for (let fieldNumber = 1; fieldNumber <= this.model.nroffields; fieldNumber++) {
        const field = new Field(competitionseason, fieldNumber);
        field.setName(String(fieldNumber));
      }

      tournament = new Tournament(competitionseason);
    }

    this.tournamentRepository.createObject(tournament)
      .subscribe(
            /* happy path */ tournamentOut => {
        // setTimeout(3000);
        const structureService = new StructureService(
          tournamentOut.getCompetitionseason(),
          { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS },
          undefined, this.model.nrofcompetitors
        );

        const planningService = new PlanningService(structureService);
        planningService.create(structureService.getFirstRound().getNumber());

        this.structureRepository.createObject(structureService.getFirstRound(), tournamentOut.getCompetitionseason())
          .subscribe(
            /* happy path */ structure => {
            // console.log(structure);
            this.router.navigate(['/toernooi/home', tournamentOut.getId()]);
          },
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */() => this.loading = false
          );
      },
            /* error path */ e => { this.error = e; this.loading = false; }
      );
  }

  equals(one: NgbDateStruct, two: NgbDateStruct) {
    return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
  }
  isSelected = date => this.equals(date, this.model.startdate);

}
