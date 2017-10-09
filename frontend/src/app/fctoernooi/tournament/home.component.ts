import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentRepository } from './repository';

@Component({
  selector: 'app-tournament-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class TournamentHomeComponent implements OnInit {

  constructor( private router: Router, private tournamentRepository: TournamentRepository ) { }

  ngOnInit() {
  }

}
