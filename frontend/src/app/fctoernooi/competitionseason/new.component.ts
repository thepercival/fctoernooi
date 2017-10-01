import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-competitionseason-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class CompetitionSeasonNewComponent implements OnInit {

  model: any = {};
  loading = false;
  error = '';
  sportnames: [string]= ["tafeltennis","darten"];
  // message: string = null;

  constructor() { }

  ngOnInit() {
  }

  create() {
    this.loading = true;
    // maak toernooi aan
    // bij lukken ga naar /toernooi/home/?id=x
    // anders toon foutmelding!!!
    this.authService.login(this.model.emailaddress, this.model.password)
        .subscribe(
            /* happy path */ p => this.router.navigate(['/admin']),
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */ () => this.loading = false
        );
  }

}
