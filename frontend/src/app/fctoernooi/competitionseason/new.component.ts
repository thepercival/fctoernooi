import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-competitionseason-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class CompetitionSeasonNewComponent implements OnInit {

  model: any = {};
  loading = false;
  error = '';
  sportnames: [string]= ['tafeltennis','darten'];
  // message: string = null;

  constructor( private router: Router/*, private authService: AuthService*/ ) { }

  ngOnInit() {
  }

  create() {
    this.loading = true;
    // maak toernooi aan
    // bij lukken ga naar /toernooi/home/?id=x
    // anders toon foutmelding!!!

    // wat moet ik wegschrijven? competitionseason/competitionseasonroles/structuur obv inputparams
    // name, sportname, sportnameother, nrofcompetitors
    // spreek een fctoernooi specifieke api call aan om ook de competitionseasonroles te zetten
    // de rest kan uit voetbal backend gehaald worden!!!
    // this.toernooiService.login(this.model.emailaddress, this.model.password)
    //     .subscribe(
    //         /* happy path */ p => this.router.navigate(['/admin']),
    //         /* error path */ e => { this.error = e; this.loading = false; },
    //         /* onComplete */ () => this.loading = false
    //     );
  }

}
