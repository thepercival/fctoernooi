import { ChangeDetectionStrategy, Component, OnInit, signal, input, inject } from '@angular/core';
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
  private globalEventsManager = inject(GlobalEventsManager);


  public showFooter = signal(false);
  constructor() {
  }

  ngOnInit() {
    this.globalEventsManager.showFooter.subscribe((showFooter: boolean) => {
      this.showFooter.set(showFooter);
    });
  }
}
