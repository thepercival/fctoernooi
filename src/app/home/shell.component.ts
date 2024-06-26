import { Component, Input } from '@angular/core';
import { DateFormatter } from '../lib/dateFormatter';
import { TournamentShell } from '../lib/tournament/shell';
import { TranslateSportService } from '../lib/translate/sport';

@Component({
  selector: '[app-home-shell]',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class HomeShellComponent {
  @Input() shell!: TournamentShell;
  @Input() showPublic!: boolean;
  @Input() linethroughDate!: Date;

  constructor(public translate: TranslateSportService, public dateFormatter: DateFormatter) {
  }

  inPast(date: Date): boolean {
    return this.linethroughDate.getTime() > date.getTime();
  }
}
