import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NavComponent } from './nav/nav.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from './svgicon.component';

@NgModule({
  declarations: [
    NavComponent,
    FooterComponent,
    SvgIconComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    NavComponent,
    FooterComponent,
    SvgIconComponent
  ]
})
export class LayoutModule {
  constructor(/*library: FaIconLibrary*/) {
    // library.addIcons(faCopyright, faTv, faSignInAlt, faEnvelope);
    // library.addIcons(faTwitter);
  }
}
