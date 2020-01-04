import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faAngleDoubleDown,
  faBasketballBall,
  faCalendarAlt,
  faChess,
  faClipboardCheck,
  faCopyright,
  faEnvelope,
  faEye,
  faFilter,
  faFutbol,
  faGamepad,
  faLevelUpAlt,
  faMobileAlt,
  faPencilAlt,
  faPlus,
  faPlusCircle,
  faSave,
  faSearch,
  faShareAlt,
  faSignInAlt,
  faSignOutAlt,
  faSpinner,
  faTableTennis,
  faTv,
  faUserCircle,
  faUserFriends,
  faUserShield,
  faVolleyballBall,
  fas,
} from '@fortawesome/free-solid-svg-icons';
import {
  NgbAlertModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbPopoverModule,
  NgbTimepickerModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  AssociationMapper,
  CompetitionMapper,
  FieldMapper,
  LeagueMapper,
  LeagueRepository,
  NameService,
  PlanningConfigMapper,
  RefereeMapper,
  RefereeRepository,
  SeasonMapper,
  SeasonRepository,
  SportConfigMapper,
  SportConfigRepository,
  SportMapper,
} from 'ngx-sport';

import { environment } from '../environments/environment';
import { AdminModule } from './admin/admin.module';
import { RoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './auth/auth.service';
import { AuthguardService } from './auth/authguard.service';
import { CSSService } from './common/cssservice';
import { GlobalEventsManager } from './common/eventmanager';
import { MyNavigation } from './common/navigation';
import { CommonSharedModule } from './common/shared.module';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { HomeShellComponent } from './home/shell.component';
import { FavoritesRepository } from './lib/favorites/repository';
import { RoleMapper } from './lib/role/mapper';
import { SponsorMapper } from './lib/sponsor/mapper';
import { SponsorRepository } from './lib/sponsor/repository';
import { TournamentMapper } from './lib/tournament/mapper';
import { TournamentRepository } from './lib/tournament/repository';
import { TournamentShellRepository } from './lib/tournament/shell/repository';
import { UserMapper } from './lib/user/mapper';
import { NavComponent } from './nav/nav.component';
import { UserModule } from './user/user.module';
import { faTwitter, fab } from '@fortawesome/free-brands-svg-icons';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    FooterComponent,
    HomeComponent,
    HomeShellComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RoutingModule,
    ReactiveFormsModule,
    CommonSharedModule,
    UserModule,
    AdminModule,
    NgbDatepickerModule, NgbTimepickerModule, NgbAlertModule, NgbPopoverModule, NgbCollapseModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    FontAwesomeModule
  ],
  providers: [
    AuthService,
    AuthguardService,
    TournamentRepository,
    TournamentMapper,
    TournamentShellRepository,
    SponsorMapper,
    RoleMapper,
    UserMapper,
    CompetitionMapper,
    SportMapper,
    PlanningConfigMapper,
    AssociationMapper,
    LeagueRepository,
    LeagueMapper,
    SeasonRepository,
    SeasonMapper,
    SponsorRepository,
    FieldRepository,
    FieldMapper,
    RefereeRepository,
    RefereeMapper,
    GlobalEventsManager,
    CSSService,
    MyNavigation,
    NameService,
    FavoritesRepository,
    SportConfigRepository,
    SportConfigMapper
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, fab);
    library.addIcons(faLevelUpAlt, faSpinner, faUserCircle, faFilter, faPencilAlt, faSave,
      faSignInAlt, faSignOutAlt, faPlusCircle, faPlus, faTv, faFutbol, faTableTennis, faSearch,
      faMobileAlt, faEnvelope, faCopyright, faEye, faShareAlt, faClipboardCheck,
      faGamepad, faBasketballBall, faChess, faVolleyballBall, faUserShield, faUserFriends, faCalendarAlt,
      faAngleDoubleDown);
    library.addIcons(
      faTwitter
    );
  }

}
