import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faAngleDoubleDown,
  faBasketballBall,
  faChess,
  faFutbol,
  faGamepad,
  faPlusCircle,
  faSave,
  faSearch,
  faSpinner,
  faTableTennis,
  faUserCircle,
  faUserFriends,
  faUserShield,
  faVolleyballBall,
  faBaseballBall,
  faHockeyPuck
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
import { TournamentUserMapper } from './lib/tournament/user/mapper';
import { TournamentShellRepository } from './lib/tournament/shell/repository';
import { UserMapper } from './lib/user/mapper';
import { LayoutModule } from './shared/layout/layout.module';
import { facDarts, facSoccerField, facTennis, facBadminton, facHockey, facSquash, facKorfball, facFavicon } from './lib/icons';
import { SportIconCustomComponent } from './home/sport/customicon.component';
// import { TournamentModule } from './shared/tournament/tournament.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HomeShellComponent,
    SportIconCustomComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RoutingModule,
    CommonSharedModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    FontAwesomeModule,
    LayoutModule/*,
    TournamentModule.forRoot(),*/
  ],
  providers: [
    AuthService,
    AuthguardService,
    TournamentShellRepository,
    TournamentUserMapper,
    UserMapper,
    GlobalEventsManager,
    MyNavigation
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faPlusCircle, faSpinner, faSearch, faAngleDoubleDown
      , faUserShield, faUserFriends, faSave, faUserCircle,
      facDarts, facSoccerField, facTennis, facBadminton, facHockey, facSquash, facKorfball,
      facFavicon
    );
    library.addIcons(
      faBasketballBall, faGamepad, faFutbol, faChess, faTableTennis, faBaseballBall, faHockeyPuck, faVolleyballBall
    );
  }
}