import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpModule } from '@angular/http';
import { RoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DndModule } from 'ng2-dnd';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';

import { AuthService } from './auth/auth.service';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { AuthguardService } from './auth/authguard.service';

import { TournamentRepository } from './fctoernooi/tournament/repository';
import { TournamentRoleRepository } from './fctoernooi/tournament/role/repository';
import { CompetitionseasonRepository } from 'voetbaljs/competitionseason/repository';
import { AssociationRepository } from 'voetbaljs/association/repository';
import { CompetitionRepository } from 'voetbaljs/competition/repository';
import { SeasonRepository } from 'voetbaljs/season/repository';
import { FieldRepository } from 'voetbaljs/field/repository';
import { RefereeRepository } from 'voetbaljs/referee/repository';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    FooterComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
     HttpModule,
     RoutingModule,
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