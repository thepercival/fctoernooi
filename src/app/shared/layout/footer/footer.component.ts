import { Component, OnInit } from '@angular/core';

import { LiveboardLink } from '../../../lib/liveboard/link';
import { GlobalEventsManager } from '../../common/eventmanager';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  showFooter: boolean = false;

  constructor(private globalEventsManager: GlobalEventsManager) {

  }

  ngOnInit() {
    this.globalEventsManager.showFooter.subscribe((show: boolean) => {
      this.showFooter = show;
    });

  }

}
