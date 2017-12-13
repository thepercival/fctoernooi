import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DndModule } from 'ng2-dnd';
import { AssociationRepository } from 'voetbaljs/association/repository';
import { CompetitionRepository } from 'voetbaljs/competition/repository';
import { CompetitionseasonRepository } from 'voetbaljs/competitionseason/repository';
import { FieldRepository } from 'voetbaljs/field/repository';
import { RefereeRepository } from 'voetbaljs/referee/repository';
import { SeasonRepository } from 'voetbaljs/season/repository';

import { AdminModule } from './admin/admin.module';
import { RoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './auth/auth.service';
import { AuthguardService } from './auth/authguard.service';
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
    NgbModule.forRoot(),
    DndModule.forRoot()
  ],
  providers: [
    AuthService,
    AuthguardService,
    TournamentRepository,
    TournamentRoleRepository,
    CompetitionseasonRepository,
    AssociationRepository,
    CompetitionRepository,
    SeasonRepository,
    FieldRepository,
    RefereeRepository
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }