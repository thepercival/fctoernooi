import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faAngleDoubleDown,
  faPlusCircle,
  faSave,
  faSpinner,
  faUserCircle,
  faUserFriends,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';

import { environment } from '../environments/environment';
import { RoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './lib/auth/auth.service';
import { AuthguardService } from './lib/auth/authguard.service';
import { GlobalEventsManager } from './shared/common/eventmanager';
import { MyNavigation } from './shared/common/navigation';
import { CommonSharedModule } from './shared/common/shared.module';
import { HomeComponent } from './home/home.component';
import { HomeShellComponent } from './home/shell.component';
import { TournamentShellRepository } from './lib/tournament/shell/repository';
import { UserMapper } from './lib/user/mapper';
import { LayoutModule } from './shared/layout/layout.module';
import { facFavicon } from './shared/tournament/icon/icons';
import { UntypedFormBuilder } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HomeShellComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RoutingModule,
    CommonSharedModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    FontAwesomeModule,
    LayoutModule
  ],
  providers: [
    AuthService,
    AuthguardService,
    TournamentShellRepository,
    UserMapper,
    GlobalEventsManager,
    UntypedFormBuilder,
    MyNavigation/*,
    {
      provide: 'placeRanges', useValue: [
        { min: 2, max: 40, placesPerPoule: { min: 2, max: 12 } },
        { min: 41, max: 128, placesPerPoule: { min: 2, max: 8 } }
      ]
    }*/
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faPlusCircle, faSpinner, faAngleDoubleDown
      , faUserShield, faUserFriends, faSave, faUserCircle, facFavicon
    );
  }
}