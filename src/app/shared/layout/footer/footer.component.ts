import { Component, OnInit } from '@angular/core';

import { GlobalEventsManager } from '../../common/eventmanager';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
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
