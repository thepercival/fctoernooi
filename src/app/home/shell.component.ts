import { Component, Input, OnInit } from '@angular/core';

import { TournamentShell } from '../lib/tournament/shell/repository';

@Component({
  selector: 'app-home-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class HomeShellComponent implements OnInit {
  @Input() shell: TournamentShell;
  @Input() showPublic: boolean;

  constructor() {
  }

  ngOnInit() {
  }
}
