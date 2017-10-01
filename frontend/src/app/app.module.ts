import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavComponent } from './nav/nav.component';
import { FooterComponent } from './footer/footer.component';

import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { AuthguardService } from './auth/authguard.service';
import { AuthService } from './auth/auth.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    FooterComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    RoutingModule,
    UserModule,
    AdminModule,
    NgbModule.forRoot()
  ],
  providers: [
    AuthguardService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
