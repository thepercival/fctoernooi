import './rxjs-extensions';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
/*import { NgbModule }     from '@ng-bootstrap/ng-bootstrap';*/
import { HttpModule }    from '@angular/http';

import { AppRoutingModule }     from './app-routing.module';

// import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService }  from './in-memory-data.service';

import { AppComponent }   from './app.component';
import { DashboardComponent } from './dashboard.component';
import { CompetitionSeasonDetailComponent } from './competitionseason-detail.component';
import { CompetitionSeasonsComponent } from './competitionseasons.component';
import { CompetitionSeasonService } from './competition-season.service';
import { CompetitionSeasonSearchComponent } from './competition-season-search.component';
import { AuthGuard } from './auth/guard';
import { AuthenticationService } from './auth/service';
import { UserService } from './user/service';
import { LoginComponent }  from './user/login.component';

@NgModule({
   imports:      [
        BrowserModule,
        FormsModule,
        HttpModule,
        // InMemoryWebApiModule.forRoot(InMemoryDataService),
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        DashboardComponent,
        CompetitionSeasonDetailComponent,
        CompetitionSeasonsComponent,
        CompetitionSeasonSearchComponent,
        LoginComponent
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


