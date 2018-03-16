import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap/alert/alert.module';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap/collapse/collapse.module';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap/popover/popover.module';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap/timepicker/timepicker.module';
import {
  AssociationRepository,
  CompetitionRepository,
  FieldRepository,
  LeagueRepository,
  RefereeRepository,
  SeasonRepository,
  StructureNameService,
} from 'ngx-sport';

import { AdminModule } from './admin/admin.module';
import { RoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './auth/auth.service';
import { AuthguardService } from './auth/authguard.service';
import { GlobalEventsManager } from './common/eventmanager';
import { IconManager } from './common/iconmanager';
import { TournamentRepository } from './fctoernooi/tournament/repository';
import { TournamentRoleRepository } from './fctoernooi/tournament/role/repository';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { NavComponent } from './nav/nav.component';
import { UserModule } from './user/user.module';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    FooterComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RoutingModule,
    FormsModule,
    UserModule,
    AdminModule,
    NgbDatepickerModule.forRoot(), NgbTimepickerModule.forRoot(), NgbAlertModule.forRoot(),
    NgbPopoverModule.forRoot(), NgbCollapseModule.forRoot(),
  ],
  providers: [
    AuthService,
    AuthguardService,
    TournamentRepository,
    TournamentRoleRepository,
    CompetitionRepository,
    AssociationRepository,
    LeagueRepository,
    SeasonRepository,
    FieldRepository,
    RefereeRepository,
    GlobalEventsManager,
    IconManager,
    StructureNameService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
