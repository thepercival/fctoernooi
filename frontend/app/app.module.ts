import './rxjs-extensions';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { NgbModule }     from '@ng-bootstrap/ng-bootstrap';
import { HttpModule }    from '@angular/http';
import { AppRoutingModule }     from './app-routing.module';
// import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService }  from './in-memory-data.service';
import { AppComponent }   from './app.component';
import { NavbarComponent }   from './navbar/component';
import { HomeComponent } from './home/component';
import { CompetitionSeasonMainComponent } from './competitionseason/main.component';
import { CompetitionSeasonService } from './competitionseason/service';
import { CompetitionSeasonSearchComponent } from './competition-season-search.component';
import { AuthGuard } from './auth/guard';
import { AuthenticationService } from './auth/service';
import { UserService } from './user/service';
import { RegisterComponent }  from './user/register.component';
import { LoginComponent }  from './user/login.component';
import { LogoutComponent }  from './user/logout.component';
import { UsersComponent }  from './user/users.component';

@NgModule({
   imports:      [
        BrowserModule,
        FormsModule,
        HttpModule,
        // InMemoryWebApiModule.forRoot(InMemoryDataService),
        NgbModule.forRoot(),
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        CompetitionSeasonMainComponent, CompetitionSeasonSearchComponent,
        RegisterComponent, LoginComponent, LogoutComponent, UsersComponent
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


