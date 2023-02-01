import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

import { EscapeHtmlPipe } from './escapehtmlpipe';
import { FocusDirective } from './focus';

@NgModule({
  declarations: [
    EscapeHtmlPipe,
    FocusDirective
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
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
