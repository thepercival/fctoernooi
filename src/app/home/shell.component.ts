import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { DateFormatter } from '../lib/dateFormatter';
import { TournamentShell } from '../lib/tournament/shell';
import { TranslateSportService } from '../lib/translate/sport';

@Component({
    selector: '[app-home-shell]',
    templateUrl: './shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./shell.component.css'],
    
})
export class HomeShellComponent {
  translate = inject(TranslateSportService);
  dateFormatter = inject(DateFormatter);

  @Input() shell!: TournamentShell;
  @Input() showPublic!: boolean;
  @Input() linethroughDate!: Date;
  constructor() {
  }

  inPast(date: Date): boolean {
    return this.linethroughDate.getTime() > date.getTime();
  }
}
