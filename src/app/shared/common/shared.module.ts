import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

import { SportIconComponent } from './sport/icon.component';
import { EscapeHtmlPipe } from './escapehtmlpipe';
import { FocusDirective } from './focus';

@NgModule({
  declarations: [
    SportIconComponent,
    EscapeHtmlPipe,
    FocusDirective
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
    SportIconComponent,
    EscapeHtmlPipe,
    FocusDirective
  ]
})

export class CommonSharedModule {
  constructor(library: FaIconLibrary/*, modalConfig: NgbModalConfig,*/) {
    library.addIcons(faUsers);
    /*modalConfig.centered = true;
    modalConfig.scrollable = true;
    modalConfig.size = 'lg';*/
  }
}
