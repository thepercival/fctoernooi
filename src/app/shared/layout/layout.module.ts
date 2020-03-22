import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSignInAlt, faSignOutAlt, faTv, faCopyright, faMobileAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';

import { NavComponent } from './nav/nav.component';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

@NgModule({
  declarations: [
    NavComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
    NavComponent
  ]
})
export class LayoutModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faCopyright, faTv, faSignInAlt, faSignOutAlt, faMobileAlt, faEnvelope);
    library.addIcons(faTwitter);
  }
}
