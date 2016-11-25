import { NgModule } from '@angular/core';
import './rxjs-extensions';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { NgbModule }     from '@ng-bootstrap/ng-bootstrap';
import { HttpModule }    from '@angular/http';
import { AppRoutingModule }     from './app-routing.module';
// import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService }  from './in-memory-data.service';
import { NavbarComponent }   from './navbar/component';
import { AppComponent }   from './app.component';
import { CompetitionSeasonMainComponent } from './competitionseason/main.component';
import { HomeComponent } from './home/component';
// import { CompetitionSeasonSearchComponent } from './competition-season-search.component';
import { CompetitionSeasonService } from './competitionseason/service';
import { AuthenticationService } from './auth/service';
import { AuthGuard } from './auth/guard';
import { UserService } from './user/service';
import { RegisterComponent }  from './user/register.component';
import { ActivateComponent }  from './user/activate.component';
import { LogoutComponent }  from './user/logout.component';
import { LoginComponent }  from './user/login.component';
import { UsersComponent }  from './user/users.component';
import { NgbdModalContent } from './competitionseason/newmodal/component';

@NgModule({
   imports:      [
        BrowserModule,
        FormsModule,
        HttpModule,
        // InMemoryWebApiModule.forRoot(InMemoryDataService),
        NgbModule.forRoot(),
        AppRoutingModule,
    ],
    declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        CompetitionSeasonMainComponent, // CompetitionSeasonSearchComponent,
        RegisterComponent, ActivateComponent, LoginComponent, LogoutComponent, UsersComponent,
        NgbdModalContent
    ],
    entryComponents: [
        NgbdModalContent
    ],
    providers:    [
        CompetitionSeasonService,
        AuthGuard,
        AuthenticationService,
        UserService
    ],
    bootstrap:    [
        AppComponent
    ]
})

export class AppModule { }



