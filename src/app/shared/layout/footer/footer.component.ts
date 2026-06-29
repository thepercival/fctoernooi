import { ChangeDetectionStrategy, Component, OnInit, signal, input } from '@angular/core';
import { GlobalEventsManager } from '../../common/eventmanager';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    standalone: true,
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {

  public showFooter = signal(false);

  constructor(private globalEventsManager: GlobalEventsManager) {
  }

  ngOnInit() {
    this.globalEventsManager.showFooter.subscribe((showFooter: boolean) => {
      this.showFooter.set(showFooter);
    });
  }
}
