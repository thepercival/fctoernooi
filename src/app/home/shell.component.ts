import { Component, Input } from '@angular/core';
import { DateFormatter } from '../lib/dateFormatter';
import { TournamentShell } from '../lib/tournament/shell';
import { TranslateService } from '../lib/translate';

@Component({
  selector: 'app-home-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class HomeShellComponent {
  @Input() shell!: TournamentShell;
  @Input() showPublic!: boolean;
  @Input() linethroughDate!: Date;

  constructor(public translate: TranslateService, public dateFormatter: DateFormatter) {
  }

  inPast(date: Date): boolean {
    return this.linethroughDate.getTime() > date.getTime();
  }
}
