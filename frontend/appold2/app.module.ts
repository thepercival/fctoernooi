import { NgModule } from '@angular/core';
import './rxjs-extensions';
import { APP_INITIALIZER } from '@angular/core';
import { AppConfig }  from './app.config';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { NgbModule }     from '@ng-bootstrap/ng-bootstrap';
import { HttpModule }    from '@angular/http';
import { AppRoutingModule }     from './app-routing.module';
import { NavbarComponent }   from './navbar/component';
import { AppComponent }   from './app.component';
import { FocusModule } from './_directives/focus.module';
import { HomeComponent } from './home/component';
import { AuthenticationService } from './auth/service';
import { AuthGuard } from './auth/guard';
import { UserService } from './user/service';
import { RegisterComponent }  from './user/register.component';
import { ActivateComponent }  from './user/activate.component';
import { LogoutComponent }  from './user/logout.component';
import { LoginComponent }  from './user/login.component';
import { UsersComponent }  from './user/users.component';
import { PasswordResetComponent, PasswordChangeComponent }  from './user/password.component';
import { GlobalEventsManager } from "./global-events-manager";
import { AdminComponent } from "./admin/component";

@NgModule({
   imports:      [
        BrowserModule,
        FormsModule,
        HttpModule,
        NgbModule.forRoot(),
        AppRoutingModule,
        FocusModule.forRoot()
    ],
    declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        AdminComponent,
        RegisterComponent, ActivateComponent, LoginComponent, LogoutComponent, PasswordResetComponent, PasswordChangeComponent, UsersComponent
    ],

    entryComponents: [

    ],
    providers:    [
        AuthGuard,
        AuthenticationService,
        UserService,
        GlobalEventsManager,
        AppConfig,
        { provide: APP_INITIALIZER, useFactory: (config: AppConfig) => () => config.load(), deps: [AppConfig], multi: true }

    ],
    bootstrap:    [
        AppComponent
    ]
})

export class AppModule { }



