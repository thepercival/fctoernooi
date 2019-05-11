import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
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
  AssociationRepository,
  CompetitionMapper,
  CompetitionRepository,
  FieldMapper,
  FieldRepository,
  LeagueMapper,
  LeagueRepository,
  NameService,
  RefereeMapper,
  RefereeRepository,
  SeasonMapper,
  SeasonRepository,
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

library.add(faLevelUpAlt, faSpinner, faUserCircle, faFilter, faPencilAlt, faSave,
  faSignInAlt, faSignOutAlt, faPlusCircle, faPlus, faTv, faFutbol, faTableTennis, faSearch,
  faMobileAlt, faEnvelope, faTwitter, faCopyright, faEye, faShareAlt, faClipboardCheck,
  faGamepad, faBasketballBall, faChess, faVolleyballBall, faUserShield, faUserFriends, faCalendarAlt,
  faAngleDoubleDown);

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    FooterComponent,
    HomeComponent,
    HomeShellComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RoutingModule,
    FormsModule,
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
    CompetitionRepository,
    CompetitionMapper,
    AssociationRepository,
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
    FavoritesRepository
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
