import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

import { SportIconComponent } from './sport/icon.component';

library.add(
  faUsers
);

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
export class CommonSharedModule { }