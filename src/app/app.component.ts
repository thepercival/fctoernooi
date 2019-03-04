import { Component } from '@angular/core';

import { MyNavigation } from './common/navigation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'FCToernooi';

  constructor(
    protected myNavigation: MyNavigation
  ) {
  }
}
