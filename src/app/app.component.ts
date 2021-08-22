import { Component } from '@angular/core';

import { MyNavigation } from './shared/common/navigation';

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
    /*const preloadElement = document.createElement('link');
    preloadElement.rel = 'preload';
    preloadElement.as = 'style';
    preloadElement.href = 'styles.css';
    document.body.appendChild(preloadElement);

    const lazyStyleElement = document.createElement('link');
    lazyStyleElement.rel = 'stylesheet';
    lazyStyleElement.href = 'styles.css';
    document.body.appendChild(lazyStyleElement);*/
  }
}
