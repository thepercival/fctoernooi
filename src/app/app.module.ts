import { HttpClientModule } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
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
import { registerLocaleData } from '@angular/common';
// import localeNl from '@angular/common/locales/nl';

// the second parameter 'nl' is optional
// registerLocaleData(localeNl, 'nl');

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
    LayoutModule
  ],
  providers: [
    AuthService,
    AuthguardService,
    TournamentShellRepository,
    UserMapper,
    GlobalEventsManager,
    MyNavigation,
    /*{ provide: LOCALE_ID, useValue: 'nl-NL'},*/
    /*,
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
  constructor() {    
  }
}