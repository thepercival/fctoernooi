import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalEventsManager } from '../../common/eventmanager';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {

  public showFooter: boolean = false;

  constructor(private globalEventsManager: GlobalEventsManager) {
  }

  ngOnInit() {
    this.globalEventsManager.showFooter.subscribe((showFooter: boolean) => {
      this.showFooter = showFooter;
    });
  }
}
