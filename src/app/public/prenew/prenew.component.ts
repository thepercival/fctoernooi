import { Component } from '@angular/core';
import { GlobalEventsManager } from '../../shared/common/eventmanager';

@Component({
  selector: 'app-tournament-prenew',
  templateUrl: './prenew.component.html',
  styleUrls: ['./prenew.component.scss']
})
export class PreNewComponent {
  constructor(
    globalEventsManager: GlobalEventsManager
  ) {
    globalEventsManager.showFooter.emit();
  }
}
