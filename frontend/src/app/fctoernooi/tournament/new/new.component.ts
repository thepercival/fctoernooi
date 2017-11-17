import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { Tournament } from '../../tournament';
import { StructureRepository } from 'voetbaljs/structure/repository';
import { Competition } from 'voetbaljs/competition';
import { StructureService } from 'voetbaljs/structure/service';
import { Season } from 'voetbaljs/season';
import { Association } from 'voetbaljs/association';
import { Competitionseason } from 'voetbaljs/competitionseason';
import { Field } from 'voetbaljs/field';

@Component({
  selector: 'app-tournament-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class TournamentNewComponent implements OnInit {

  model: any;
  loading = false;
  error = '';
  sportnames: [string] = ['darten', 'tafeltennis', 'voetbal'];
  validations: any = {
    'minnrofcompetitors': Tournament.MINNROFCOMPETITORS,
    'maxnrofcompetitors': Tournament.MAXNROFCOMPETITORS,
    'minnroffields': 1,
    'maxnroffields': 16,
    'minlengthname': Competition.MIN_LENGTH_NAME,
    'maxlengthname': Competition.MAX_LENGTH_NAME
  };
  // message: string = null;

  constructor(
    private router: Router,
    private tournamentRepository: TournamentRepository,
    private structureRepository: StructureRepository) {
    const date = new Date();
    date.setTime(date.getTime() + (60 * 10 * 1000)); // 10 minutes

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
    console.log(this.model.name, sportName, this.model.nrofcompetitors);

    const startdate = new Date(
      this.model.startdate.year,
      this.model.startdate.month - 1,
      this.model.startdate.day,
      this.model.starttime.hour,
      this.model.starttime.minute
    );

    const association = new Association('username'); // dummy
    const competition = new Competition(this.model.name);
    const season = new Season('123'); // dummy
    season.setStartdate(new Date());
    season.setEnddate(new Date());
    const competitionseason = new Competitionseason(association, competition, season);
    competitionseason.setSport(sportName);
    competitionseason.setStartDateTime(startdate);
    for (let fieldNumber = 1; fieldNumber <= this.model.nroffields; fieldNumber++) {
      const field = new Field(competitionseason, fieldNumber);
      field.setName(String(fieldNumber));
    }

    const tournament = new Tournament(competitionseason);

    console.log(tournament);

    this.tournamentRepository.createObject(tournament)
      .subscribe(
            /* happy path */ tournamentOut => {
        // setTimeout(3000);
        console.log(tournamentOut);

        const structureService = new StructureService(
          competitionseason,
          { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS },
          null, this.model.nrofcompetitors
        );

        console.log(structureService.getFirstRound());
        this.structureRepository.createObject(structureService.getFirstRound(), tournamentOut.getCompetitionseason())
          .subscribe(
            /* happy path */ structure => {
            console.log(structure);

            this.router.navigate(['/toernooi/home', tournamentOut.getId()]);
          },
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */() => this.loading = false
          );
      },
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */() => this.loading = false
      );
  }

}
