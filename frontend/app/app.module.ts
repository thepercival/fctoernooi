import { NgModule } from '@angular/core';
import './rxjs-extensions';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { NgbModule }     from '@ng-bootstrap/ng-bootstrap';
import { HttpModule }    from '@angular/http';
import { AppRoutingModule }     from './app-routing.module';
import { NavbarComponent }   from './navbar/component';
import { AppComponent }   from './app.component';
import { FocusModule } from './_directives/focus.module';
import { CompetitionSeasonIndexComponent } from './competitionseason/index.component';
import { CompetitionSeasonStructureComponent } from './competitionseason/structure.component';
import { CompetitionSeasonRoundComponent } from './competitionseason/round.component';
import { CompetitionSeasonPouleComponent } from './competitionseason/poule.component';
import { HomeComponent } from './home/component';
import { CompetitionSeasonService } from './competitionseason/service';
import { CompetitionSeasonInMemoryService } from './competitionseason/service.inmemory';
import { AuthenticationService } from './auth/service';
import { AuthGuard } from './auth/guard';
import { UserService } from './user/service';
import { RegisterComponent }  from './user/register.component';
import { ActivateComponent }  from './user/activate.component';
import { LogoutComponent }  from './user/logout.component';
import { LoginComponent }  from './user/login.component';
import { UsersComponent }  from './user/users.component';
import { NgbdModalContent } from './competitionseason/newmodal/component';
import { PasswordResetComponent, PasswordChangeComponent }  from './user/password.component';
import { GlobalEventsManager } from "./global-events-manager";
// import { CompetitionSeasonSearchComponent } from './competition-season-search.component';
// import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService }  from './in-memory-data.service';

@NgModule({
   imports:      [
        BrowserModule,
        FormsModule,
        HttpModule,
        // InMemoryWebApiModule.forRoot(InMemoryDataService),
        NgbModule.forRoot(),
        AppRoutingModule,
        FocusModule.forRoot()
    ],
    declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        CompetitionSeasonIndexComponent, CompetitionSeasonStructureComponent,
        CompetitionSeasonRoundComponent, CompetitionSeasonPouleComponent,
        RegisterComponent, ActivateComponent, LoginComponent, LogoutComponent, PasswordResetComponent, PasswordChangeComponent, UsersComponent,
        NgbdModalContent
    ],
    entryComponents: [
        NgbdModalContent
    ],
    providers:    [
        CompetitionSeasonService, CompetitionSeasonInMemoryService,
        AuthGuard,
        AuthenticationService,
        UserService,
        GlobalEventsManager
    ],
    bootstrap:    [
        AppComponent
    ]
})

export class AppModule { }



