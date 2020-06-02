import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSignInAlt, faTv, faCopyright, faMobileAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';

import { NavComponent } from './nav/nav.component';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    NavComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule
  ],
  exports: [
    NavComponent,
    FooterComponent
  ]
})
export class LayoutModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faCopyright, faTv, faSignInAlt, faMobileAlt, faEnvelope);
    library.addIcons(faTwitter);
  }
}
