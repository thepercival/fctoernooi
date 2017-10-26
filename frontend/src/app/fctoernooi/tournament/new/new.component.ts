import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { Competition } from 'voetbaljs/competition';
import { Tournament } from '../../tournament';

@Component({
  selector: 'app-tournament-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class TournamentNewComponent implements OnInit {

  model: any;
  loading = false;
  error = '';
  sportnames: [string]= ['tafeltennis', 'darten'];
  validations: any = {
    'minnrofcompetitors' : Tournament.MINNROFCOMPETITORS,
    'maxnrofcompetitors' : Tournament.MAXNROFCOMPETITORS,
    'minnroffields' : 1,
    'maxnroffields' : 16,
    'minlengthname' : Competition.MIN_LENGTH_NAME,
    'maxlengthname' : Competition.MAX_LENGTH_NAME
  };
  // message: string = null;

  constructor(
    private router: Router,
    private tournamentRepository: TournamentRepository ) {
      const date = new Date();
      date.setTime( date.getTime() + ( 60 * 10 * 1000 ) ); // 10 minutes

      this.model = {
          starttime: {hour: date.getHours(), minute: date.getMinutes() },
          startdate: {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()},
          nrofcompetitors: 5,
          nroffields: 1
        };
    }

  ngOnInit() {
  }

  create() {
    if ( this.model.nrofcompetitors < 3 || this.model.nrofcompetitors > 64 ) {
      return;
    }
    this.loading = true;

    const sportName = this.model.sportname !== -1 ? this.model.sportname : this.model.sportnameother;
    console.log(this.model.name, sportName, this.model.nrofcompetitors, this.model.equalnrofgames === true );

      const startdate = new Date(
          this.model.startdate.year,
          this.model.startdate.month - 1,
          this.model.startdate.day,
          this.model.starttime.hour,
          this.model.starttime.minute
      );

    const json = {
        'name': this.model.name,
        'sportname': sportName,
        'nrofcompetitors': this.model.nrofcompetitors,
        'nroffields': this.model.nroffields,
        'startdate': startdate.toISOString()
    };

    this.tournamentRepository.createObject(json)
        .subscribe(
            /* happy path */ tournament => {
              console.log(tournament);
              this.router.navigate(['/toernooi/home', tournament.getId()]);
            },
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */ () => this.loading = false
        );
  }

}
