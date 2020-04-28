import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
import {
  NgbAlertModule,
  NgbCollapseModule,
} from '@ng-bootstrap/ng-bootstrap';

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
import { FavoritesRepository } from './lib/favorites/repository';
import { RoleMapper } from './lib/role/mapper';
import { TournamentShellRepository } from './lib/tournament/shell/repository';
import { UserMapper } from './lib/user/mapper';
import { LayoutModule } from './shared/layout/layout.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HomeShellComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    RoutingModule,
    ReactiveFormsModule,
    CommonSharedModule,
    NgbAlertModule, NgbCollapseModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    FontAwesomeModule,
    LayoutModule
  ],
  providers: [
    AuthService,
    AuthguardService,
    TournamentShellRepository,
    RoleMapper,
    UserMapper,
    GlobalEventsManager,
    MyNavigation,
    FavoritesRepository
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faPlusCircle, faSpinner, faSearch, faAngleDoubleDown
      , faUserShield, faUserFriends, faSave, faUserCircle
      /*faLevelUpAlt, faSpinner, faFilter, faPencilAlt,
      faSignInAlt, faSignOutAlt, faPlusCircle, faPlus, faTv, faSearch,
      faMobileAlt, faEnvelope, faCopyright, faEye, faShareAlt,
      , faCalendarAlt,
      faAngleDoubleDown*/);
    library.addIcons(
      faBasketballBall, faGamepad, faFutbol, faChess, faTableTennis, faBaseballBall, faHockeyPuck, faVolleyballBall
    );
  }
}
