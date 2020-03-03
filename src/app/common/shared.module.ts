import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

import { SportIconComponent } from './sport/icon.component';

@NgModule({
  declarations: [
    SportIconComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
    SportIconComponent
  ]
})
export class CommonSharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faUsers);
  }
}
