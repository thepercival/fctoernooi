import { Component, OnInit } from '@angular/core';
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

import { AuthService } from '../../../auth/auth.service';
import { Tournament } from '../../tournament';
import { TournamentRepository } from '../repository';


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
    'minlengthname': League.MIN_LENGTH_NAME,
    'maxlengthname': League.MAX_LENGTH_NAME
  };
  // message: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private tournamentRepository: TournamentRepository,
    private roundRepository: RoundRepository,
    private structureRepository: StructureRepository,
    private planningRepository: PlanningRepository
  ) {
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
      const league = new League(this.model.name);
      league.setAssociation(association);
      league.setSport(sportName);
      const season = new Season('123'); // dummy
      season.setStartDateTime(new Date());
      season.setEndDateTime(new Date());
      const competition = new Competition(league, season);
      competition.setStartDateTime(startdate);
      for (let fieldNumber = 1; fieldNumber <= this.model.nroffields; fieldNumber++) {
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
            undefined, this.model.nrofcompetitors
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
                      this.router.navigate(['/toernooi/home', tournamentOut.getId()]);
                    },
                  /* error path */ e => { this.error = e; this.loading = false; }
                  );
              },
            /* error path */ e => { this.error = e; this.loading = false; }
            );
        },
            /* error path */ e => { this.error = e; this.loading = false; },
                  /* onComplete */() => this.loading = false
      );
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  equals(one: NgbDateStruct, two: NgbDateStruct) {
    return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
  }
  isSelected = date => this.equals(date, this.model.startdate);

}
